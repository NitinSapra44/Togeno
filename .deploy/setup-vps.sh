#!/bin/bash
# ============================================================
# Trodec VPS Setup Script — run once on a fresh Ubuntu 22.04 VPS
# Usage: bash setup-vps.sh
# ============================================================

set -e

DOMAIN="YOUR_DOMAIN"          # e.g. trodec.com
API_DOMAIN="YOUR_API_DOMAIN"  # e.g. api.trodec.com
APP_DIR="/var/www/trodec"
REPO_URL="YOUR_GIT_REPO_URL"  # e.g. git@github.com:user/trodec.git
EMAIL="YOUR_EMAIL"             # for SSL certificate notifications

echo "=== [1/8] Updating system packages ==="
apt-get update && apt-get upgrade -y

echo "=== [2/8] Installing Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== [3/8] Installing Nginx & Certbot ==="
apt-get install -y nginx certbot python3-certbot-nginx git

echo "=== [4/8] Installing PM2 ==="
npm install -g pm2

echo "=== [5/8] Cloning repository ==="
mkdir -p "$APP_DIR"
git clone "$REPO_URL" "$APP_DIR"

echo "=== [6/8] Installing dependencies and building ==="
# Backend
cd "$APP_DIR/backend/trodec-backend"
npm install
npm run build

# Frontend
cd "$APP_DIR/frontend/trodec-frontend"
npm install
npm run build

echo "=== [7/8] Setting up Nginx ==="
cp "$APP_DIR/.deploy/nginx.conf" /etc/nginx/sites-available/trodec
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" /etc/nginx/sites-available/trodec
sed -i "s/YOUR_API_DOMAIN/$API_DOMAIN/g" /etc/nginx/sites-available/trodec
ln -sf /etc/nginx/sites-available/trodec /etc/nginx/sites-enabled/trodec
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== [8/8] Obtaining SSL certificates ==="
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "$API_DOMAIN" --non-interactive --agree-tos -m "$EMAIL"

echo ""
echo "=== Setup complete! ==="
echo "Next steps:"
echo "  1. Copy .env files:  cp $APP_DIR/backend/trodec-backend/.env.example $APP_DIR/backend/trodec-backend/.env"
echo "     Then edit it:      nano $APP_DIR/backend/trodec-backend/.env"
echo "  2. Copy frontend env: cp $APP_DIR/frontend/trodec-frontend/.env.example $APP_DIR/frontend/trodec-frontend/.env.local"
echo "     Then edit it:      nano $APP_DIR/frontend/trodec-frontend/.env.local"
echo "  3. Start apps:        cd $APP_DIR && pm2 start ecosystem.config.cjs --env production"
echo "  4. Save PM2 on boot:  pm2 save && pm2 startup"
