#!/bin/sh
# Ticks the webinar reminder queue. Installed in crontab on the VPS:
#   */2 * * * * /var/www/gdi-futureworks/scripts/webinar-cron.sh >/dev/null 2>&1
# Reads the shared secret from .env and hits the local app (behind nginx/Cloudflare bypassed).
cd /var/www/gdi-futureworks || exit 0
S=$(grep '^WEBINAR_SECRET=' .env | cut -d= -f2)
[ -n "$S" ] || exit 0
curl -fsS --max-time 150 "http://localhost:3000/api/webinar/cron?secret=$S" -o /dev/null
