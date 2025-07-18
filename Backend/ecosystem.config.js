module.exports = {
  apps: [{
    name: 'gatherguru-backend',
    script: 'server.js',
    instances: 1, // Single instance for free tier
    exec_mode: 'fork', // Fork mode for single instance
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '512M', // Reduced for free tier (1GB RAM)
    node_args: '--max-old-space-size=512', // Reduced for free tier
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Free tier optimizations
    min_uptime: '10s',
    max_restarts: 5,
    restart_delay: 4000
  }]
}; 