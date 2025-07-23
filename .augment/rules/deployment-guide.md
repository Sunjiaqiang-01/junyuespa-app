---
trigger: manual
description: "部署指南 - 详细的服务器部署步骤"
---

# 服务器部署指南

## 服务器信息
- **IP地址**：154.23.181.173
- **服务商**：华纳云香港
- **配置**：2核4GB 5M带宽
- **系统**：Ubuntu 22.04 LTS
- **密码**：Lk3)Pp8-Fe0#

## 部署步骤

### 1. 连接服务器
```bash
ssh root@154.23.181.173
# 密码：Lk3)Pp8-Fe0#
```

### 2. 环境准备
```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 安装PM2
npm install -g pm2

# 安装Nginx
apt install nginx -y
```

### 3. 项目部署
```bash
# 进入网站目录
cd /var/www

# 克隆项目
git clone https://github.com/Sunjiaqiang-01/junyuespa-app.git junyuespa

# 进入项目目录
cd junyuespa

# 安装前端依赖并构建
cd frontend
npm install
npm run build

# 安装后端依赖
cd ../backend
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 启动后端服务
pm2 start npm --name "junyuespa-backend" -- start
pm2 save
```

### 4. Nginx配置
```bash
# 创建Nginx配置
cat > /etc/nginx/sites-available/junyuespa << 'EOF'
server {
    listen 80;
    server_name 154.23.181.173;

    # 前端静态文件
    location / {
        root /var/www/junyuespa/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 日志
    access_log /var/log/nginx/junyuespa_access.log;
    error_log /var/log/nginx/junyuespa_error.log;
}
EOF

# 启用网站配置
ln -sf /etc/nginx/sites-available/junyuespa /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 5. 设置权限
```bash
chown -R www-data:www-data /var/www/junyuespa
chmod -R 755 /var/www/junyuespa
```

### 6. 验证部署
```bash
# 检查PM2状态
pm2 status

# 检查Nginx状态
systemctl status nginx

# 测试网站
curl -I http://localhost
curl -I http://localhost/api/health
```

## 常用维护命令
```bash
# 重启后端服务
pm2 restart junyuespa-backend

# 查看后端日志
pm2 logs junyuespa-backend

# 重启Nginx
systemctl restart nginx

# 查看Nginx日志
tail -f /var/log/nginx/junyuespa_error.log
```
