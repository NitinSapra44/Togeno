#!/bin/bash
# ============================================================
# Trodec VPS Setup Script — run once on a fresh Ubuntu 22.04 VPS
# Usage: sudo bash .deploy/setup-vps.sh
# ============================================================

set -e

DOMAIN="trodec.com"
API_DOMAIN="api.trodec.com"
APP_DIR="/var/www/trodec"
REPO_URL="YOUR_GIT_REPO_URL"  # e.g. git@github.com:user/trodec.git
EMAIL="YOUR_EMAIL"             # for SSL certificate notifications

echo "=== [1/9] Updating system packages ==="
apt-get update && apt-get upgrade -y

echo "=== [2/9] Adding 2GB swap (prevents OOM during Next.js build) ==="
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Swap created."
else
  echo "Swap already exists, skipping."
fi

echo "=== [3/9] Installing Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== [4/9] Installing Nginx & Certbot ==="
apt-get install -y nginx certbot python3-certbot-nginx git

echo "=== [5/9] Installing PM2 ==="
npm install -g pm2

echo "=== [6/9] Cloning repository ==="
mkdir -p "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"

echo ""
echo ">>> STOP: Copy your .env files now before building <<<"
echo "  cp $APP_DIR/backend/trodec-backend/.env.example $APP_DIR/backend/trodec-backend/.env"
echo "  nano $APP_DIR/backend/trodec-backend/.env"
echo "  cp $APP_DIR/frontend/trodec-frontend/.env.example $APP_DIR/frontend/trodec-frontend/.env.local"
echo "  nano $APP_DIR/frontend/trodec-frontend/.env.local"
echo ""
read -p "Press ENTER once .env files are filled in to continue building..."

echo "=== [7/9] Installing dependencies and building ==="
# Backend
cd "$APP_DIR/backend/trodec-backend"
npm ci --omit=dev
npm run build

# Frontend (extra memory for build)
cd "$APP_DIR/frontend/trodec-frontend"
npm ci
NODE_OPTIONS="--max-old-space-size=1536" npm run build

echo "=== [8/9] Setting up Nginx ==="
cp "$APP_DIR/.deploy/nginx.conf" /etc/nginx/sites-available/trodec
ln -sf /etc/nginx/sites-available/trodec /etc/nginx/sites-enabled/trodec
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== [9/9] Obtaining SSL certificates ==="
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "$EMAIL"

echo ""
echo "=== Starting apps ==="
cd "$APP_DIR"
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup

echo ""
echo "=== Setup complete! ==="
echo "  Frontend: https://$DOMAIN"
echo "  Backend:  https://$API_DOMAIN"
