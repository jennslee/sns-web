#!/bin/bash
# Start backend and frontend simultaneously

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting FastAPI backend on :8000..."
cd "$REPO_ROOT/backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting Vite frontend on :5173..."
cd "$REPO_ROOT"
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "======================================"
echo "  Backend  : http://localhost:8000"
echo "  Frontend  : http://localhost:5173"
echo "  API Docs  : http://localhost:8000/docs"
echo "======================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
