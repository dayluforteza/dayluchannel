#!/usr/bin/env bash
# Vuelve a descargar los negocios de OpenStreetMap, los puntúa y compara con la versión anterior.
set -e
cd "$(dirname "$0")"
cp leads.json leads.prev.json
python3 fetch_osm.py leads.new.json
python3 enrich.py leads.new.json
python3 audit.py leads.new.json
python3 - <<'PY'
import json
old={l["id"] for l in json.load(open("leads.prev.json"))}
new=json.load(open("leads.new.json"))
nuevos=[l for l in new if l["id"] not in old]
print("TOTAL",len(new),"NUEVOS",len(nuevos),"NUEVOS_ALTA",sum(1 for l in nuevos if l["puntuacion"]>=70))
for l in nuevos[:10]: print("-",l["puntuacion"],l["nombre"],"|",l["municipio"],"|",l["telefono"])
PY
mv leads.new.json leads.json
