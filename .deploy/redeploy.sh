#!/bin/bash
# ============================================================
# Trodec Redeploy Script — run after every code update
# Usage: bash .deploy/redeploy.sh
# ============================================================

set -e

APP_DIR="/var/www/trodec"

# Ensure .env files exist before building
if [ ! -f "$APP_DIR/backend/trodec-backend/.env" ]; then
  echo "ERROR: backend .env not found. Copy from .env.example and fill in values."
  exit 1
fi

if [ ! -f "$APP_DIR/frontend/trodec-frontend/.env.local" ]; then
  echo "ERROR: frontend .env.local not found. Copy from .env.example and fill in values."
  exit 1
fi

echo "=== [1/4] Pulling latest code ==="
cd "$APP_DIR"
git pull

echo "=== [2/4] Rebuilding backend ==="
cd "$APP_DIR/backend/trodec-backend"
npm ci --omit=dev
npm run build

echo "=== [3/4] Rebuilding frontend ==="
cd "$APP_DIR/frontend/trodec-frontend"
npm ci
NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "=== [4/4] Restarting services ==="
cd "$APP_DIR"
pm2 restart ecosystem.config.cjs --env production

echo ""
echo "=== Done! ==="
pm2 status
