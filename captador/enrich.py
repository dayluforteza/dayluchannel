"""Asigna municipio aproximado (núcleo más cercano) y penaliza cadenas/franquicias."""
import json, sys, math, urllib.request, urllib.parse
from fetch_osm import run
leads = json.load(open(sys.argv[1]))
q = '[out:json][timeout:120];area["name"="Málaga"]["admin_level"="6"]->.a;node["place"~"^(city|town|village|suburb)$"]["name"](area.a);out;'
places = [(e["tags"]["name"], e["lat"], e["lon"], e["tags"]["place"]) for e in run(q)["elements"]]
cities = [p for p in places if p[3] != "suburb"]
def nearest(lat, lon, pool):
    return min(pool, key=lambda p: (p[1]-lat)**2 + ((p[2]-lon)*math.cos(math.radians(lat)))**2)
CHAIN = ["servicio oficial","grupo ","mapfre","allianz","axa","santalucía","generali","tecnocasa","remax","re/max","century 21","engel","kiwoko","sanitas","vitaldent","dentix","adeslas","marcos","multiópticas","general óptica","opticalia","carglass","norauto","midas","feu vert","speedy","euromaster","llaollao","the body shop","yves rocher","primor","druni","sephora"]
for l in leads:
    if l["lat"]:
        if not l["municipio"]:
            l["municipio"] = nearest(l["lat"], l["lon"], cities)[0]
        s = nearest(l["lat"], l["lon"], places)
        l["zona"] = s[0] if s[3] == "suburb" and l["municipio"] == "Málaga" else ""
    l["municipio"] = l["municipio"].replace("Torrox Costa","Torrox-Costa")
    n = (l["nombre"] or "").lower()
    if any(c in n for c in CHAIN):
        l["puntuacion"] = max(0, l["puntuacion"] - 60); l["motivos"].append("Cadena o franquicia: decide la central")
    r = l["redes"]
    if r and not any(x in r for x in ["facebook","instagram","tiktok"]):
        l["web"], l["redes"] = l["web"] or r, ""
        if "Sin web" in l["motivos"]:
            l["motivos"] = [m for m in l["motivos"] if m not in ("Sin web","Solo redes sociales")]
            l["puntuacion"] = max(0, l["puntuacion"] - 60)
leads.sort(key=lambda x: (-x["puntuacion"], x["nombre"] or ""))
json.dump(leads, open(sys.argv[1], "w"), ensure_ascii=False, separators=(",",":"))
import collections
print(collections.Counter(l["municipio"] for l in leads).most_common(12))
print("top", sum(1 for l in leads if l["puntuacion"]>=70))
