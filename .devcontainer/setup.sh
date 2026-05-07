#!/bin/bash
set -e

echo "=== Installing Python dependencies ==="
pip install fastapi uvicorn sqlalchemy aiosqlite python-dotenv aiofiles 2>/dev/null || true

echo "=== Installing Node dependencies ==="
cd /workspaces/sns-web
npm install

echo "=== Creating .env if missing ==="
ENV_PATH=/workspaces/sns-web/../sns_analyzer/.env
if [ ! -f "$ENV_PATH" ]; then
  mkdir -p "$(dirname $ENV_PATH)"
  cat > "$ENV_PATH" <<'EOF'
YOUTUBE_API_KEY=
INSTAGRAM_USERNAME=
INSTAGRAM_PASSWORD=
SPREADSHEET_ID=
DRIVE_FOLDER_ID=
YOUTUBE_MAX_RESULTS=30
YOUTUBE_MAX_COMMENTS=100
DEFAULT_PLATFORM=both
EOF
  echo ".env created at $ENV_PATH"
fi

echo "=== Setup complete ==="
