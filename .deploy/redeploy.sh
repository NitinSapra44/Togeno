#!/bin/bash
# ============================================================
# Trodec Redeploy Script — run after every code update
# Usage: bash redeploy.sh
# ============================================================

set -e

APP_DIR="/var/www/trodec"

echo "=== Pulling latest code ==="
cd "$APP_DIR"
git pull

echo "=== Rebuilding backend ==="
cd "$APP_DIR/backend/trodec-backend"
npm install
npm run build

echo "=== Rebuilding frontend ==="
cd "$APP_DIR/frontend/trodec-frontend"
npm install
npm run build

echo "=== Restarting services ==="
cd "$APP_DIR"
pm2 restart ecosystem.config.cjs --env production

echo "=== Done! ==="
pm2 status
