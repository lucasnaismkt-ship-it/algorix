#!/bin/bash

# Script para iniciar o servidor em ambiente interno
echo "Iniciando servidor para ambiente interno..."
echo "O servidor estará disponível em:"
echo "- Local: http://localhost:5173"
echo "- Rede: http://$(hostname -I | awk '{print $1}'):5173"
echo ""

npm run dev
