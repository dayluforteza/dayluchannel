#!/bin/bash
# Doble clic para arrancar Prospector en macOS.
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Falta Node.js. Instala la version LTS y vuelve a abrir este archivo."
  open "https://nodejs.org/es/download"
  read -n 1 -s -r -p "Pulsa una tecla para cerrar"
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "Instalando Prospector. Solo la primera vez, tarda 1-2 minutos..."
  npm install || { read -n 1 -s -r -p "Error en la instalacion. Pulsa una tecla"; exit 1; }
fi
echo "Prospector arrancando en http://localhost:5173 — para cerrarlo, cierra esta ventana."
npm run app
