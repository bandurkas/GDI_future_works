#!/bin/bash
export SSHPASS='w7XBiu++Ph4t4dlB1nWRMwzznowtt6k5'

echo "Syncing files..."
sshpass -e rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' . root@168.231.118.173:/var/www/gdi-futureworks/

echo "Building and restarting..."
sshpass -e ssh -o StrictHostKeyChecking=no root@168.231.118.173 << 'REMOTE'
cd /var/www/gdi-futureworks
npm install --legacy-peer-deps
npm run build
pm2 restart all || npm run start &
REMOTE

echo "Deployed!"
