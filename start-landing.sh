#!/usr/bin/env bash
# Arranca la landing (Next.js) para ver los cambios en vivo.
# Uso: ./start-landing.sh   o   bash start-landing.sh
cd "$(dirname "$0")/web"
npm install
npm run dev
