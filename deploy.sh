#!/bin/bash
set -e

VPS="root@168.231.118.173"
VPS_DIR="/var/www/gdi-futureworks"
SSH_PASS="B@nd73610421"

ssh_cmd() {
  sshpass -p "$SSH_PASS" ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no "$VPS" "$1"
}

rsync_cmd() {
  sshpass -p "$SSH_PASS" rsync -avz \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude '*.tar.gz' \
    --exclude '*.swp' \
    --exclude '.DS_Store' \
    -e "ssh -o StrictHostKeyChecking=no -o PreferredAuthentications=password -o PubkeyAuthentication=no" \
    ./ "$VPS:$VPS_DIR/"
}

echo "🚀 Deploying to $VPS..."

echo "🧪 Running pre-deploy tests..."
npx playwright test tests/e2e/whatsapp.spec.ts --project=chromium --reporter=line
if [ $? -ne 0 ]; then
  echo "❌ Tests failed — deploy aborted"
  exit 1
fi
echo "✅ Tests passed"

echo "📦 Syncing files (skipping .env.local)..."
rsync_cmd

echo "🔨 Building on VPS..."
ssh_cmd "cd $VPS_DIR && npm install --legacy-peer-deps --silent && npx prisma db push && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build"

echo "♻️  Restarting PM2..."
ssh_cmd "pm2 restart gdi --update-env && pm2 save"

echo "✅ Done! https://gdifuture.works"
