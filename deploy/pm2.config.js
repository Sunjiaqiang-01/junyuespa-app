// PM2配置文件 - 君悦彩虹SPA生产环境
module.exports = {
  apps: [
    {
      name: 'junyue-spa-api',
      script: './backend/src/index.js',
      cwd: '/var/www/junyue',
      instances: 2, // 2个实例，充分利用2核CPU
      exec_mode: 'cluster',
      
      // 环境配置
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // 自动重启配置
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      max_memory_restart: '500M',
      
      // 日志配置
      log_file: '/var/log/junyue/combined.log',
      out_file: '/var/log/junyue/out.log',
      error_file: '/var/log/junyue/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 重启策略
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // 健康检查
      health_check_grace_period: 3000,
      
      // 环境变量文件
      env_file: '/var/www/junyue/deploy/production.env',
      
      // 进程管理
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // 性能监控
      monitoring: true,
      pmx: true,
      
      // 源码映射
      source_map_support: true,
      
      // 实例配置
      instance_var: 'INSTANCE_ID',
      
      // 错误处理
      error_file: '/var/log/junyue/error.log',
      combine_logs: true,
      
      // 时间配置
      time: true,
      
      // 自动重启条件
      restart_delay: 4000,
      
      // 集群配置
      wait_ready: true,
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ],
  
  // 部署配置
  deploy: {
    production: {
      user: 'root',
      host: '154.23.181.173',
      ref: 'origin/main',
      repo: 'https://github.com/Sunjiaqiang-01/junyuespa-app.git',
      path: '/var/www/junyue',
      
      // 部署前命令
      'pre-deploy-local': '',
      
      // 部署命令
      'post-deploy': `
        npm install --production &&
        cd backend && npm install --production &&
        cd ../frontend && npm install --production &&
        npm run build &&
        cd .. &&
        npx prisma generate &&
        npx prisma db push &&
        pm2 reload ecosystem.config.js --env production
      `,
      
      // 部署前服务器命令
      'pre-setup': '',
      
      // 环境变量
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
