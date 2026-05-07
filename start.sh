#!/bin/bash
REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Install frontend deps if missing
if [ ! -d "$REPO_ROOT/frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  cd "$REPO_ROOT/frontend" && npm install
fi

# Start FastAPI backend
echo "Starting backend on :8000..."
cd "$REPO_ROOT/backend"
nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload \
  > /tmp/backend.log 2>&1 &
echo "Backend PID: $!"

# Start Vite from frontend directory (not workspace root)
echo "Starting frontend on :5173..."
cd "$REPO_ROOT/frontend"
nohup npm run dev -- --host \
  > /tmp/frontend.log 2>&1 &
echo "Frontend PID: $!"

sleep 3
echo ""
echo "======================================"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:8000"
echo "  API Docs : http://localhost:8000/docs"
echo "======================================"
echo ""
tail -5 /tmp/frontend.log
