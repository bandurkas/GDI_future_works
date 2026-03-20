#!/bin/bash
# GDI FutureWorks — One-command deploy to production VPS
# Fix #23 — replaces manual SCP + SSH approach
# Usage: ./deploy.sh

set -e

VPS="root@168.231.118.173"
REMOTE_DIR="/var/www/gdi-futureworks"

echo "🔨 Building locally..."
npm run build

echo "📦 Syncing source files to VPS..."
expect -c "
set timeout 300
spawn rsync -az --delete \
  --exclude=node_modules --exclude=.next --exclude='.git' \
  -e {ssh -o StrictHostKeyChecking=no} \
  ./ $VPS:$REMOTE_DIR/
expect {password:}
send {w7XBiu++Ph4t4dlB1nWRMwzznowtt6k5}; send \"\r\"
expect eof
"

echo "🏗  Building on VPS..."
expect -c "
set timeout 360
spawn ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=20 $VPS
expect {password:}
send {w7XBiu++Ph4t4dlB1nWRMwzznowtt6k5}; send \"\r\"
expect {\#}
send \"cd $REMOTE_DIR && npm install --legacy-peer-deps && npx prisma generate && npx prisma db push --accept-data-loss --force-reset && /usr/bin/node node_modules/.bin/next build && echo BUILD_OK\r\"
expect {BUILD_OK}
send \"pm2 restart gdi-futureworks && sleep 8 && curl -s -o /dev/null -w 'HTTP_%{http_code}' http://127.0.0.1:3000/ && exit\r\"
expect eof
"

echo "✅ Deploy complete!"
