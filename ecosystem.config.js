module.exports = {
  apps: [
    {
      name: 'assistencia',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: '1',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3005
      }
    }
  ]
}; 