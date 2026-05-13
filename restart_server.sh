#!/bin/bash

# ===================================================
# restart_server.sh — PampaTec Pré-Incubação
# Reinicia o servidor local para desenvolvimento/testes
# Uso: bash restart_server.sh
# ===================================================

set -e

echo "============================================"
echo " PampaTec Pré-Incubação — Restart Local"
echo "============================================"

# 1. Verifica se o .env existe
if [ ! -f .env ]; then
  echo "[ERRO] Arquivo .env não encontrado."
  echo "Crie o .env a partir do .env.example com suas credenciais."
  exit 1
fi

# 2. Mata processos anteriores nas portas do backend (3001) e frontend (5174)
echo "[1/4] Limpando processos anteriores..."
for PORT in 3001 5174; do
  PID=$(lsof -ti:$PORT 2>/dev/null || true)
  if [ -n "$PID" ]; then
    echo "  → Matando processo na porta $PORT (PID: $PID)"
    kill -9 $PID 2>/dev/null || true
    sleep 1
  else
    echo "  → Porta $PORT livre"
  fi
done

# 3. Instala dependências (raiz e frontend)
echo "[2/4] Instalando dependências do backend..."
npm install --silent

echo "[3/4] Instalando dependências do frontend..."
npm install --silent --prefix src

# 4. Sobe servidor fullstack (backend + frontend em paralelo)
echo "[4/4] Iniciando servidor fullstack..."
echo ""
echo "  Backend: http://localhost:3001"
echo "  Frontend: http://localhost:5174"
echo "  Health:   http://localhost:3001/api/health"
echo ""
echo "  Pressione Ctrl+C para parar ambos."
echo "============================================"
echo ""

npx concurrently \
  --names "BACK,FRONT" \
  --prefix-colors "green,blue" \
  "npm run dev" "npm run dev --prefix src"
