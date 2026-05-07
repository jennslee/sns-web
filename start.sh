#!/bin/bash
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting FastAPI backend on :8000..."
cd "$REPO_ROOT/backend"
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
  > /tmp/backend.log 2>&1 &
echo "Backend PID: $!"

echo "Starting Vite frontend on :5173..."
cd "$REPO_ROOT"
nohup npm run dev -- --host \
  > /tmp/frontend.log 2>&1 &
echo "Frontend PID: $!"

echo ""
echo "======================================"
echo "  Backend  : http://localhost:8000"
echo "  Frontend  : http://localhost:5173"
echo "  API Docs  : http://localhost:8000/docs"
echo "  Logs      : tail -f /tmp/backend.log"
echo "             tail -f /tmp/frontend.log"
echo "======================================"
