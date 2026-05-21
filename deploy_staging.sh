#!/bin/bash
# Deploy current working directory to staging.gdifuture.works on VPS.
# Mirrors deploy_no_tests.sh but targets the staging app on port 3001.
set -e

VPS="root@168.231.118.173"
VPS_DIR="/var/www/gdi-staging"
PM2_APP="gdi-staging"
SSH_PASS="B@nd73610421"

ssh_cmd() {
  sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no "$VPS" "$1"
}

rsync_cmd() {
  sshpass -p "$SSH_PASS" rsync -avz \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude 'scratch' \
    --exclude '.agents' \
    --exclude '*.tar.gz' \
    --exclude '*.swp' \
    --exclude '.DS_Store' \
    -e "ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no" \
    ./ "$VPS:$VPS_DIR/"
}

echo "🚀 Deploying to STAGING ($VPS:$VPS_DIR)..."

echo "📦 Syncing files..."
rsync_cmd

echo "🔨 Building on VPS..."
ssh_cmd "cd $VPS_DIR && npm install --legacy-peer-deps --silent && npx prisma db push --accept-data-loss && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build"

echo "♻️  Restarting PM2 app $PM2_APP..."
ssh_cmd "pm2 restart $PM2_APP --update-env && pm2 save"

echo "✅ Done! https://staging.gdifuture.works"
