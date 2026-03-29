module.exports = {
  apps: [{
    name: 'gdi',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/gdi-futureworks',
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--openssl-legacy-provider --max-old-space-size=512',
    },
    max_memory_restart: '500M',
    restart_delay: 3000,
    max_restarts: 10,
  }]
};
