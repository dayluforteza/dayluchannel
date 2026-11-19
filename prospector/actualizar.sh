#!/usr/bin/env bash
# Actualiza Prospector para toda España y Portugal:
# descarga los extractos de OpenStreetMap (openstreetmap.fr), los procesa en local,
# audita webs y deja solo los de mayor probabilidad. Compara con la versión anterior.
set -u
cd "$(dirname "$0")"
D="${PROSPECTOR_DATA:-/tmp/prospector-osm}"; mkdir -p "$D"
pip install -q osmium shapely >/dev/null 2>&1 || true
[ -f "$D/es-prov.geojson" ] || curl -sL -o "$D/es-prov.geojson" https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-provinces.geojson
[ -f "$D/pt.geojson" ] || curl -sL -o "$D/pt.geojson" https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/portugal.geojson
for c in portugal spain; do
  rm -f "$D/$c.osm.pbf"
  for i in 1 2 3 4 5; do curl -sL -C - -o "$D/$c.osm.pbf" "https://download.openstreetmap.fr/extracts/europe/$c-latest.osm.pbf" && break; sleep 30; done
done
python3 - <<'PY' > /tmp/prospector-prev-ids.txt
import json,glob
for f in glob.glob("leads/*.json"):
    for l in json.load(open(f)): print(l["id"])
PY
python3 process_pbf.py "$D" || { echo "ERROR procesando"; exit 1; }
python3 - <<'PY'
import json,glob
old=set(open("/tmp/prospector-prev-ids.txt").read().split())
new=[l for f in glob.glob("leads/*.json") for l in json.load(open(f))]
nu=[l for l in new if l["id"] not in old]
print("TOTAL",len(new),"NUEVOS",len(nu))
for l in sorted(nu,key=lambda x:-x["puntuacion"])[:10]: print("-",l["puntuacion"],l["nombre"],"|",l["municipio"],"|",l["provincia"],"|",l["telefono"])
PY
