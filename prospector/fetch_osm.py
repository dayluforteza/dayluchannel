"""Descarga negocios de la provincia de Málaga desde OpenStreetMap (Overpass) y los puntúa."""
import json, sys, urllib.request, urllib.parse, datetime, time

MIRRORS = ["https://maps.mail.ru/osm/tools/overpass/api/interpreter",
           "https://overpass-api.de/api/interpreter"]

# nicho -> filtros OSM
NICHOS = {
  "Oficios y reformas": ['craft~"^(electrician|plumber|painter|carpenter|locksmith|builder|hvac|tiler|roofer|glazier|plasterer|stonemason|metal_construction)$"', 'shop="doityourself"'],
  "Talleres": ['shop~"^(car_repair|tyres|motorcycle_repair)$"', 'amenity="car_wash"'],
  "Peluquería y estética": ['shop~"^(hairdresser|beauty|massage|cosmetics)$"', 'amenity="spa"'],
  "Fisioterapia y salud": ['healthcare~"^(physiotherapist|podiatrist|psychotherapist|optometrist|alternative)$"', 'shop="optician"'],
  "Clínicas dentales y veterinarias": ['amenity~"^(dentist|veterinary|clinic)$"', 'healthcare~"^(dentist|clinic)$"'],
  "Inmobiliarias, gestorías y abogados": ['office~"^(estate_agent|lawyer|accountant|tax_advisor|insurance)$"', 'shop="estate_agent"'],
}
TICKET = {"Oficios y reformas":"650-800 €","Talleres":"650-800 €","Peluquería y estética":"650-800 €",
          "Fisioterapia y salud":"650-800 €","Clínicas dentales y veterinarias":"1.000-2.000 €",
          "Inmobiliarias, gestorías y abogados":"1.000-2.000 €"}

def query(filters):
    parts = "".join(f'nwr[{f}]["name"](area.a);' for f in filters)
    return f'[out:json][timeout:180];area["name"="Málaga"]["admin_level"="6"]->.a;({parts});out center tags;'

def run(q):
    data = urllib.parse.urlencode({"data": q}).encode()
    last = None
    for m in MIRRORS:
        for _ in range(5):
            try:
                req = urllib.request.Request(m, data=data, headers={"User-Agent": "lead-finder/0.1"})
                return json.load(urllib.request.urlopen(req, timeout=200))
            except Exception as e:
                last = e
                time.sleep(10)
    raise last

def score(t):
    s, motivos = 0, []
    web = t.get("website") or t.get("contact:website") or t.get("url")
    social = t.get("contact:instagram") or t.get("contact:facebook") or t.get("facebook") or t.get("instagram")
    if not web:
        s += 50; motivos.append("Sin web")
        if social: s += 10; motivos.append("Solo redes sociales")
    elif any(x in web for x in ["facebook.com","instagram.com","wixsite","business.site","negocio.site"]):
        s += 35; motivos.append("Web gratuita o red social como web")
    phone = t.get("phone") or t.get("contact:phone") or t.get("contact:mobile")
    if phone: s += 20; motivos.append("Teléfono disponible")
    else: s -= 30; motivos.append("Sin teléfono: buscar en Google")
    if t.get("opening_hours"): s += 5
    if t.get("email") or t.get("contact:email"): s += 5
    return max(0, min(100, s)), motivos, web, phone, social

def main():
    out, hoy = [], datetime.date.today().isoformat()
    for nicho, f in NICHOS.items():
        res = run(query(f))
        seen = set()
        for e in res["elements"]:
            t = e.get("tags", {})
            key = f'{e["type"]}{e["id"]}'
            if key in seen: continue
            seen.add(key)
            sc, motivos, web, phone, social = score(t)
            lat = e.get("lat") or e.get("center", {}).get("lat")
            lon = e.get("lon") or e.get("center", {}).get("lon")
            dire = " ".join(x for x in [t.get("addr:street",""), t.get("addr:housenumber","")] if x).strip()
            out.append({
              "id": key, "nombre": t.get("name"), "nicho": nicho, "ticket": TICKET[nicho],
              "tipo": t.get("craft") or t.get("shop") or t.get("amenity") or t.get("healthcare") or t.get("office"),
              "direccion": dire, "municipio": t.get("addr:city") or "", "cp": t.get("addr:postcode") or "",
              "telefono": phone or "", "email": t.get("email") or t.get("contact:email") or "",
              "web": web or "", "redes": social or "", "horario": t.get("opening_hours") or "",
              "lat": lat, "lon": lon, "puntuacion": sc, "motivos": motivos,
              "maps": f"https://www.google.com/maps/search/?api=1&query={urllib.parse.quote((t.get('name') or '') + ' ' + (t.get('addr:city') or 'Málaga'))}",
              "fuente": "OpenStreetMap", "actualizado": hoy,
            })
        print(nicho, len(seen), file=sys.stderr)

    out.sort(key=lambda x: -x["puntuacion"])
    json.dump(out, open(sys.argv[1] if len(sys.argv)>1 else "leads.json","w"), ensure_ascii=False)
    print("TOTAL", len(out), file=sys.stderr)

if __name__ == "__main__":
    main()
