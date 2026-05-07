#!/bin/bash
set -e

echo "=== Installing Python dependencies ==="
pip install fastapi uvicorn[standard] sqlalchemy aiosqlite python-dotenv aiofiles websockets 2>/dev/null || true

echo "=== Installing Node dependencies ==="
cd /workspaces/sns-web
npm install
npm install @rollup/rollup-linux-x64-gnu --save-optional 2>/dev/null || true

echo "=== Creating placeholder .env ==="
ENV_DIR="/workspaces/sns_analyzer"
mkdir -p "$ENV_DIR"
ENV_PATH="$ENV_DIR/.env"
if [ ! -f "$ENV_PATH" ]; then
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

# Create stub collectors/analyzers so backend imports don't fail in Codespaces
STUBS_DIR="/workspaces/sns_analyzer"
if [ ! -f "$STUBS_DIR/collectors/__init__.py" ]; then
  mkdir -p "$STUBS_DIR/collectors" "$STUBS_DIR/analyzers" "$STUBS_DIR/utils"
  touch "$STUBS_DIR/__init__.py" \
        "$STUBS_DIR/collectors/__init__.py" \
        "$STUBS_DIR/analyzers/__init__.py" \
        "$STUBS_DIR/utils/__init__.py"

  cat > "$STUBS_DIR/config.py" <<'EOF'
import os
REPORT_DIR = os.path.join(os.path.dirname(__file__), "reports")
EOF

  echo "Stub modules created"
fi

echo "=== Setup complete ==="
