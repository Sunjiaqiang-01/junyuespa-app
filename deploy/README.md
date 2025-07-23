# 君悦彩虹SPA生产环境部署指南

## 🚀 快速部署

### 自动部署（推荐）
```bash
# 给部署脚本执行权限
chmod +x deploy/deploy.sh

# 执行自动部署
./deploy/deploy.sh
```

### 手动部署
如果自动部署失败，可以按照以下步骤手动部署：

## 📋 部署前准备

### 1. 服务器信息
- **IP地址**: 154.23.181.173
- **用户名**: root
- **密码**: Lk3)Pp8-Fe0#
- **配置**: 2核4GB 5M带宽
- **系统**: Ubuntu/CentOS

### 2. 域名配置
- **主域名**: junyue.app
- **API域名**: api.junyue.app
- **DNS解析**: A记录指向 154.23.181.173

### 3. 数据库准备
- **开发环境**: SQLite
- **生产环境**: Supabase PostgreSQL
- **迁移**: 需要配置Supabase连接信息

## 🔧 手动部署步骤

### 第一步：本地构建
```bash
# 1. 安装依赖
npm install
cd backend && npm install --production && cd ..
cd frontend && npm install && cd ..

# 2. 构建前端
cd frontend && npm run build && cd ..

# 3. 生成Prisma客户端
cd backend && npx prisma generate && cd ..
```

### 第二步：上传文件
```bash
# 创建部署包
tar -czf junyue-spa.tar.gz \
  backend/ \
  frontend/dist/ \
  deploy/ \
  package.json \
  capacitor.config.ts

# 上传到服务器
scp junyue-spa.tar.gz root@154.23.181.173:/tmp/
```

### 第三步：服务器配置
```bash
# SSH连接服务器
ssh root@154.23.181.173

# 创建项目目录
mkdir -p /var/www/junyue
mkdir -p /var/log/junyue
mkdir -p /var/www/junyue/uploads

# 解压项目文件
cd /var/www/junyue
tar -xzf /tmp/junyue-spa.tar.gz

# 设置权限
chown -R www-data:www-data /var/www/junyue
chmod -R 755 /var/www/junyue
chmod -R 777 /var/www/junyue/uploads
```

### 第四步：安装环境
```bash
# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 安装PM2
npm install -g pm2

# 安装Nginx
apt-get update
apt-get install -y nginx
```

### 第五步：配置服务
```bash
# 配置Nginx
cp /var/www/junyue/deploy/nginx.conf /etc/nginx/sites-available/junyue.app
ln -sf /etc/nginx/sites-available/junyue.app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t

# 配置环境变量
cp /var/www/junyue/deploy/production.env /var/www/junyue/.env
```

### 第六步：启动服务
```bash
# 启动API服务
cd /var/www/junyue
pm2 start deploy/pm2.config.js --env production
pm2 save
pm2 startup

# 启动Nginx
systemctl restart nginx
systemctl enable nginx
```

## 🔐 SSL证书配置

### 使用Let's Encrypt（免费）
```bash
# 安装Certbot
apt-get install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d junyue.app -d www.junyue.app -d api.junyue.app

# 自动续期
crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 手动配置SSL证书
1. 将证书文件上传到 `/etc/ssl/certs/junyue.app.crt`
2. 将私钥文件上传到 `/etc/ssl/private/junyue.app.key`
3. 重启Nginx: `systemctl restart nginx`

## 🗄️ 数据库配置

### Supabase配置
1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 获取连接信息：
   - Database URL
   - API URL
   - Anon Key
   - Service Key
4. 更新 `.env` 文件中的数据库配置
5. 运行数据库迁移：
   ```bash
   cd /var/www/junyue/backend
   npx prisma db push
   ```

## 💰 支付配置

### 云够支付配置
1. 登录云够支付商户后台
2. 获取商户号和密钥
3. 更新 `.env` 文件：
   ```bash
   YUNGOU_MCH_ID=你的商户号
   YUNGOU_KEY=你的商户密钥
   ```
4. 配置回调地址：`https://api.junyue.app/api/payments/callback/yungou`

## 📊 监控和日志

### PM2监控
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs junyue-spa-api

# 重启应用
pm2 restart junyue-spa-api

# 查看监控面板
pm2 monit
```

### Nginx日志
```bash
# 访问日志
tail -f /var/log/nginx/junyue_access.log

# 错误日志
tail -f /var/log/nginx/junyue_error.log
```

### 应用日志
```bash
# 应用日志
tail -f /var/log/junyue/app.log

# PM2日志
tail -f /var/log/junyue/combined.log
```

## 🔧 常见问题

### 1. 服务无法启动
```bash
# 检查端口占用
netstat -tlnp | grep :3000

# 检查PM2状态
pm2 status

# 查看错误日志
pm2 logs junyue-spa-api --err
```

### 2. Nginx配置错误
```bash
# 测试配置
nginx -t

# 重新加载配置
nginx -s reload

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 3. 数据库连接失败
```bash
# 检查环境变量
cat /var/www/junyue/.env | grep DATABASE

# 测试数据库连接
cd /var/www/junyue/backend
npx prisma db pull
```

### 4. SSL证书问题
```bash
# 检查证书有效期
openssl x509 -in /etc/ssl/certs/junyue.app.crt -text -noout

# 续期Let's Encrypt证书
certbot renew
```

## 🚀 部署后验证

### 1. 健康检查
- API健康检查: `https://api.junyue.app/health`
- 前端访问: `https://junyue.app`

### 2. 功能测试
- 用户注册/登录
- 技师浏览
- 订单创建
- 支付流程

### 3. 性能测试
```bash
# 使用ab进行压力测试
ab -n 1000 -c 10 https://api.junyue.app/health
```

## 📞 技术支持

如果部署过程中遇到问题，请检查：
1. 服务器日志
2. 网络连接
3. 防火墙设置
4. 域名解析

---

**部署完成后，君悦彩虹SPA将在生产环境中正常运行！** 🎉
