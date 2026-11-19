"""Descarga negocios de toda España (provincias) y Portugal (distritos) desde OpenStreetMap,
audita sus webs y guarda SOLO los de mayor probabilidad de compra (puntuación >= MIN y con teléfono).
Uso: python3 fetch_all.py [CODIGO ...]   (sin códigos = todas)"""
import json, sys, os, re, math, time, datetime, urllib.request, urllib.parse, concurrent.futures as cf
from audit import audit, classify, score, FREE
MIN = 70
MIRRORS = ["https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass-api.de/api/interpreter"]
ES = {"C":"A Coruña","VI":"Álava","AB":"Albacete","A":"Alicante","AL":"Almería","O":"Asturias","AV":"Ávila","BA":"Badajoz","PM":"Illes Balears","B":"Barcelona","BU":"Burgos","CC":"Cáceres","CA":"Cádiz","S":"Cantabria","CS":"Castellón","CR":"Ciudad Real","CO":"Córdoba","CU":"Cuenca","GI":"Girona","GR":"Granada","GU":"Guadalajara","SS":"Gipuzkoa","H":"Huelva","HU":"Huesca","J":"Jaén","LO":"La Rioja","GC":"Las Palmas","LE":"León","L":"Lleida","LU":"Lugo","M":"Madrid","MA":"Málaga","MU":"Murcia","NA":"Navarra","OR":"Ourense","P":"Palencia","PO":"Pontevedra","SA":"Salamanca","TF":"Santa Cruz de Tenerife","SG":"Segovia","SE":"Sevilla","SO":"Soria","T":"Tarragona","TE":"Teruel","TO":"Toledo","V":"Valencia","VA":"Valladolid","BI":"Bizkaia","ZA":"Zamora","Z":"Zaragoza","CE":"Ceuta","ML":"Melilla"}
ALT = {"O":"AS","S":"CB","M":"MD","MU":"MC","NA":"NC","LO":"RI","PM":"IB"}  # uniprovinciales
PT = {"01":"Aveiro","02":"Beja","03":"Braga","04":"Bragança","05":"Castelo Branco","06":"Coimbra","07":"Évora","08":"Faro","09":"Guarda","10":"Leiria","11":"Lisboa","12":"Portalegre","13":"Porto","14":"Santarém","15":"Setúbal","16":"Viana do Castelo","17":"Vila Real","18":"Viseu","20":"Açores","30":"Madeira"}
NICHOS = [
 ("Oficios y reformas", r'craft~"^(electrician|plumber|painter|carpenter|locksmith|builder|hvac|tiler|roofer|glazier|plasterer|stonemason|metal_construction)$"', "craft"),
 ("Oficios y reformas", r'shop="doityourself"', "shop"),
 ("Talleres", r'shop~"^(car_repair|tyres|motorcycle_repair)$"', "shop"),
 ("Talleres", r'amenity="car_wash"', "amenity"),
 ("Peluquería y estética", r'shop~"^(hairdresser|beauty|massage|cosmetics)$"', "shop"),
 ("Peluquería y estética", r'amenity="spa"', "amenity"),
 ("Fisioterapia y salud", r'healthcare~"^(physiotherapist|podiatrist|psychotherapist|optometrist|alternative)$"', "healthcare"),
 ("Fisioterapia y salud", r'shop="optician"', "shop"),
 ("Clínicas dentales y veterinarias", r'amenity~"^(dentist|veterinary|clinic)$"', "amenity"),
 ("Clínicas dentales y veterinarias", r'healthcare~"^(dentist|clinic)$"', "healthcare"),
 ("Inmobiliarias, gestorías y abogados", r'office~"^(estate_agent|lawyer|accountant|tax_advisor|insurance)$"', "office"),
 ("Inmobiliarias, gestorías y abogados", r'shop="estate_agent"', "shop"),
]
TICKET = {"Clínicas dentales y veterinarias":"1.000-2.000 €","Inmobiliarias, gestorías y abogados":"1.000-2.000 €"}
CHAIN = ["servicio oficial","grupo ","mapfre","allianz","axa","santalucía","santa lucia","generali","tecnocasa","remax","re/max","century 21","engel","kiwoko","tiendanimal","sanitas","vitaldent","dentix","adeslas","marcos","multiópticas","multiopticas","general óptica","general optica","opticalia","carglass","norauto","midas","feu vert","speedy","euromaster","first stop","the body shop","yves rocher","primor","druni","sephora","llongueras","jean louis david","franck provost","mussa","multicare","fidelidade","ageas","generali","zurich","mutua","liberty","caixa","ok seguros","ibercaja","unicaja","santander","bbva","pelos","marco aldany","toni&guy","toni & guy"]
EXCL = re.compile(r"notar|notári", re.I)

def overpass(q):
    data = urllib.parse.urlencode({"data": q}).encode(); last = None
    for i in range(6):
        m = MIRRORS[i % len(MIRRORS)]
        try:
            req = urllib.request.Request(m, data=data, headers={"User-Agent": "lead-finder/0.2"})
            j = json.load(urllib.request.urlopen(req, timeout=420))
            if "remark" in j and "error" in j.get("remark","").lower() and not j.get("elements"): raise RuntimeError(j["remark"][:200])
            return j
        except Exception as e:
            last = e; time.sleep(15 * (i + 1))
    raise last

def query(area_sel):
    parts = "".join(f'nwr[{f}]["name"](area.a);' for _, f, _ in NICHOS)
    return (f'[out:json][timeout:400][maxsize:1073741824];{area_sel}->.a;({parts});out center tags;'
            f'node["place"~"^(city|town|village|suburb)$"]["name"](area.a);out;')

def nicho_de(t):
    for n, f, k in NICHOS:
        v = t.get(k)
        if not v: continue
        m = re.match(r'(\w+)~"\^\((.*)\)\$"', f)
        if m and re.fullmatch(m.group(2), v): return n
        m = re.match(r'(\w+)="(.*)"', f)
        if m and v == m.group(2): return n
    return None

def run_area(code, name, country):
    iso = f"{country}-{code}"
    cands = [f'area["ISO3166-2"="{iso}"]']
    if country == "ES" and code in ALT: cands.append(f'area["ISO3166-2"="ES-{ALT[code]}"]')
    res = None
    for sel in cands:
        res = overpass(query(sel))
        if any("place" not in e.get("tags", {}) for e in res["elements"]): break
    els = res["elements"]
    places = [(e["tags"]["name"], e["lat"], e["lon"], e["tags"]["place"]) for e in els if e["type"]=="node" and "place" in e.get("tags",{}) and not nicho_de(e["tags"])]
    towns = [p for p in places if p[3] != "suburb"] or places
    def nearest(lat, lon, pool):
        return min(pool, key=lambda p: (p[1]-lat)**2 + ((p[2]-lon)*math.cos(math.radians(lat)))**2) if pool else None
    hoy = datetime.date.today().isoformat(); seen = set(); leads = []; named = 0
    for e in els:
        t = e.get("tags", {}); n = nicho_de(t)
        if not n: continue
        key = f'{e["type"]}{e["id"]}'
        if key in seen: continue
        seen.add(key); named += 1
        nom = t.get("name") or ""
        if EXCL.search(nom) or t.get("office") == "notary": continue
        if any(c in nom.lower() for c in CHAIN) or t.get("brand"): continue
        phone = t.get("phone") or t.get("contact:phone") or t.get("contact:mobile") or ""
        if not phone: continue
        lat = e.get("lat") or e.get("center", {}).get("lat"); lon = e.get("lon") or e.get("center", {}).get("lon")
        muni = t.get("addr:city") or ""
        if not muni and lat and towns: muni = nearest(lat, lon, towns)[0]
        zona = ""
        if lat and places:
            s = nearest(lat, lon, places)
            if s and s[3] == "suburb": zona = s[0]
        web = t.get("website") or t.get("contact:website") or t.get("url") or ""
        social = t.get("contact:instagram") or t.get("contact:facebook") or t.get("facebook") or t.get("instagram") or ""
        if social and not any(x in social for x in ["facebook","instagram","tiktok"]): web, social = web or social, ""
        dire = " ".join(x for x in [t.get("addr:street",""), t.get("addr:housenumber","")] if x).strip()
        leads.append({"id": key, "nombre": nom, "nicho": n, "ticket": TICKET.get(n, "650-800 €"),
            "tipo": t.get("craft") or t.get("shop") or t.get("amenity") or t.get("healthcare") or t.get("office"),
            "direccion": dire, "municipio": muni, "cp": t.get("addr:postcode") or "", "telefono": phone,
            "email": t.get("email") or t.get("contact:email") or "", "web": web, "redes": social,
            "horario": t.get("opening_hours") or "", "lat": lat, "lon": lon, "pais": country, "provincia": name,
            "maps": "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(nom + " " + (muni or name)),
            "fuente": "OpenStreetMap", "actualizado": hoy, "motivos": []})
    todo = {l["web"] for l in leads if l["web"] and not any(f in l["web"] for f in FREE)}
    aud = {}
    if todo:
        with cf.ThreadPoolExecutor(40) as ex:
            for u, w in zip(todo, ex.map(audit, todo)): aud[u] = w
    out = []
    for l in leads:
        w = aud.get(l["web"]); l["auditWeb"] = w
        l["webStatus"], l["issues"] = classify(l, w)
        if l["redes"] and not l["web"]: l["motivos"].append("Solo redes sociales")
        l["puntuacion"] = score(l)
        if l["puntuacion"] >= MIN: out.append(l)
    out.sort(key=lambda x: (-x["puntuacion"], x["nombre"]))
    return out, named, len(leads)

if __name__ == "__main__":
    os.makedirs("leads", exist_ok=True)
    idx_path = "provincias.json"
    idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    todos = [("ES", c, n) for c, n in ES.items()] + [("PT", c, n) for c, n in PT.items()]
    want = set(sys.argv[1:])
    for country, code, name in todos:
        iso = f"{country}-{code}"
        if want and iso not in want: continue
        t0 = time.time()
        try:
            out, named, withphone = run_area(code, name, country)
        except Exception as e:
            print(iso, "ERROR", str(e)[:150], flush=True); continue
        json.dump(out, open(f"leads/{iso}.json", "w"), ensure_ascii=False, separators=(",", ":"))
        munis = {}
        for l in out: munis[l["municipio"] or "Sin municipio"] = munis.get(l["municipio"] or "Sin municipio", 0) + 1
        idx[iso] = {"pais": country, "nombre": name, "negocios": named, "conTelefono": withphone, "candidatos": len(out),
                    "municipios": dict(sorted(munis.items(), key=lambda x: -x[1])), "actualizado": datetime.date.today().isoformat()}
        json.dump(idx, open(idx_path, "w"), ensure_ascii=False, indent=0)
        print(iso, name, "negocios", named, "con tel", withphone, "candidatos", len(out), f"{time.time()-t0:.0f}s", flush=True)
        time.sleep(3)
    print("FIN", flush=True)
