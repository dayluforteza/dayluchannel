"""Procesa los extractos de OpenStreetMap (España y Portugal) en local, sin depender de Overpass.
Asigna provincia/distrito por polígono, municipio por núcleo más cercano, audita las webs y
guarda SOLO los negocios con puntuación >= MIN y teléfono: leads/<ISO>.json + provincias.json.
Uso: python3 process_pbf.py DIR_CON_PBF_Y_GEOJSON"""
import json, sys, os, re, time, datetime, unicodedata, urllib.parse, concurrent.futures as cf
import osmium
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from fetch_all import ES, PT, NICHOS, TICKET, CHAIN, EXCL, nicho_de, MIN
from audit import audit, classify, score, FREE

D = sys.argv[1]
INE = dict(zip([f"{i:02d}" for i in range(1, 53)], "VI AB A AL AV BA PM B BU CC CA CS CR CO C CU GI GR GU SS H HU J LE L LO LU M MA MU NA OR O P GC PO SA TF S SG SE SO T TE TO V VA BI ZA Z CE ML".split()))
norm = lambda s: unicodedata.normalize("NFD", s or "").encode("ascii", "ignore").decode().lower().strip()
PTN = {norm(v): k for k, v in PT.items()}
polys, isos = [], []
for f in json.load(open(f"{D}/es-prov.geojson"))["features"]:
    polys.append(shape(f["geometry"])); isos.append("ES-" + INE[f["properties"]["cod_prov"]])
for f in json.load(open(f"{D}/pt.geojson"))["features"]:
    k = PTN.get(norm(f["properties"]["name"]))
    if k: polys.append(shape(f["geometry"])); isos.append("PT-" + k)
tree = STRtree(polys)
def iso_of(lon, lat):
    if lon < -24 and lat > 36: return "PT-20"            # Açores
    if -17.5 < lon < -16 and 32 < lat < 33.3: return "PT-30"  # Madeira
    p = Point(lon, lat)
    for i in tree.query(p):
        if polys[i].contains(p): return isos[i]
    i = tree.nearest(p)
    return isos[i] if polys[i].distance(p) < 0.03 else None

KEYS = ("craft", "shop", "amenity", "healthcare", "office")
class H(osmium.SimpleHandler):
    def __init__(s): super().__init__(); s.pois = []; s.places = []
    def _add(s, typ, oid, tags, lon, lat):
        t = {k: v for k, v in tags}
        if "place" in t and t["place"] in ("city", "town", "village", "suburb") and "name" in t:
            s.places.append((t["name"], lon, lat, t["place"]))
        if "name" in t and any(k in t for k in KEYS):
            n = nicho_de(t)
            if n: s.pois.append((f"{typ}{oid}", n, t, lon, lat))
    def node(s, n):
        if n.tags and n.location.valid(): s._add("node", n.id, n.tags, n.location.lon, n.location.lat)
    def way(s, w):
        if not w.tags or not any(k in w.tags for k in KEYS + ("place",)): return
        try:
            pts = [(nd.lon, nd.lat) for nd in w.nodes if nd.location.valid()]
        except Exception: return
        if pts: s._add("way", w.id, w.tags, sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts))

def main():
    for need, mb in (("spain.osm.pbf", 1000), ("portugal.osm.pbf", 200)):
        f = f"{D}/{need}"
        if not os.path.exists(f) or os.path.getsize(f) < mb * 1024 * 1024:
            print("ERROR: falta o está incompleto", need, "- no se tocan los datos actuales", flush=True); sys.exit(1)
    h = H(); t0 = time.time()
    for pbf in ("portugal.osm.pbf", "spain.osm.pbf", "canarias.osm.pbf", "melilla.osm.pbf"):
        if not os.path.exists(f"{D}/{pbf}"): print("falta", pbf, flush=True); continue
        h.apply_file(f"{D}/{pbf}", locations=True, idx="flex_mem")
        print(pbf, "POIs", len(h.pois), "núcleos", len(h.places), f"{time.time()-t0:.0f}s", flush=True)
    # núcleos por provincia
    from collections import defaultdict
    pl = defaultdict(list)
    for nm, lon, lat, kind in h.places:
        i = iso_of(lon, lat)
        if i: pl[i].append((nm, lon, lat, kind))
    ptree = {}
    for i, lst in pl.items():
        towns = [x for x in lst if x[3] != "suburb"] or lst
        ptree[i] = (STRtree([Point(x[1], x[2]) for x in towns]), towns, STRtree([Point(x[1], x[2]) for x in lst]), lst)
    hoy = datetime.date.today().isoformat(); seen = set(); byprov = defaultdict(list); stats = defaultdict(lambda: [0, 0])
    for key, n, t, lon, lat in h.pois:
        if key in seen: continue
        seen.add(key)
        iso = iso_of(lon, lat)
        if not iso: continue
        stats[iso][0] += 1
        nom = t.get("name", "")
        if EXCL.search(nom) or t.get("office") == "notary": continue
        if any(c in nom.lower() for c in CHAIN) or t.get("brand"): continue
        phone = t.get("phone") or t.get("contact:phone") or t.get("contact:mobile") or ""
        if not phone: continue
        stats[iso][1] += 1
        muni, zona = t.get("addr:city") or "", ""
        if iso in ptree:
            tt, towns, ta, alls = ptree[iso]; p = Point(lon, lat)
            if not muni: muni = towns[tt.nearest(p)][0]
            near = alls[ta.nearest(p)]
            if near[3] == "suburb": zona = near[0]
        web = t.get("website") or t.get("contact:website") or t.get("url") or ""
        social = t.get("contact:instagram") or t.get("contact:facebook") or t.get("facebook") or t.get("instagram") or ""
        if social and not any(x in social for x in ["facebook", "instagram", "tiktok"]): web, social = web or social, ""
        prov = (ES if iso.startswith("ES") else PT)[iso[3:]]
        byprov[iso].append({"id": key, "nombre": nom, "nicho": n, "ticket": TICKET.get(n, "650-800 €"),
            "tipo": t.get("craft") or t.get("shop") or t.get("amenity") or t.get("healthcare") or t.get("office"),
            "direccion": " ".join(x for x in [t.get("addr:street", ""), t.get("addr:housenumber", "")] if x).strip(),
            "municipio": muni, "zona": zona, "cp": t.get("addr:postcode") or "", "telefono": phone,
            "email": t.get("email") or t.get("contact:email") or "", "web": web, "redes": social,
            "horario": t.get("opening_hours") or "", "lat": lat, "lon": lon, "pais": iso[:2], "provincia": prov,
            "maps": "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(nom + " " + (muni or prov)),
            "fuente": "OpenStreetMap", "actualizado": hoy, "motivos": []})
    allw = {l["web"] for v in byprov.values() for l in v if l["web"] and not any(f in l["web"] for f in FREE)}
    print("webs a auditar", len(allw), flush=True)
    aud = {}
    with cf.ThreadPoolExecutor(48) as ex:
        for k, (u, w) in enumerate(zip(allw, ex.map(audit, allw))):
            aud[u] = w
            if k % 2000 == 0: print("auditadas", k, flush=True)
    os.makedirs("leads", exist_ok=True); idx = {}
    for iso in sorted(set(list(ES and ["ES-" + c for c in ES]) + ["PT-" + c for c in PT])):
        out = []
        for l in byprov.get(iso, []):
            w = aud.get(l["web"]); l["auditWeb"] = w
            l["webStatus"], l["issues"] = classify(l, w)
            if l["redes"] and not l["web"]: l["motivos"].append("Solo redes sociales")
            l["puntuacion"] = score(l)
            if l["puntuacion"] >= MIN: out.append(l)
        out.sort(key=lambda x: (-x["puntuacion"], x["nombre"]))
        json.dump(out, open(f"leads/{iso}.json", "w"), ensure_ascii=False, separators=(",", ":"))
        mun = defaultdict(int)
        for l in out: mun[l["municipio"] or "Sin municipio"] += 1
        idx[iso] = {"pais": iso[:2], "nombre": (ES if iso.startswith("ES") else PT)[iso[3:]], "negocios": stats[iso][0],
                    "conTelefono": stats[iso][1], "candidatos": len(out), "municipios": dict(sorted(mun.items(), key=lambda x: -x[1])), "actualizado": hoy}
        print(iso, idx[iso]["nombre"], stats[iso], len(out), flush=True)
    json.dump(idx, open("provincias.json", "w"), ensure_ascii=False, separators=(",", ":"))
    print("FIN", sum(v["candidatos"] for v in idx.values()), f"{time.time()-t0:.0f}s", flush=True)

if __name__ == "__main__":
    main()
