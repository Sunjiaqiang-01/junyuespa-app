#!/bin/bash

# 君悦彩虹SPA生产环境部署脚本
# 服务器：华纳云 154.23.181.173
# 域名：junyue.app

set -e  # 遇到错误立即退出

echo "🚀 开始部署君悦彩虹SPA到生产环境..."

# 配置变量
SERVER_IP="154.23.181.173"
SERVER_USER="root"
SERVER_PASSWORD="Lk3)Pp8-Fe0#"
DOMAIN="junyue.app"
PROJECT_PATH="/var/www/junyue"
BACKUP_PATH="/var/backups/junyue"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查本地环境
check_local_environment() {
    log_info "检查本地环境..."
    
    # 检查必要的命令
    command -v git >/dev/null 2>&1 || { log_error "需要安装Git"; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "需要安装Node.js和npm"; exit 1; }
    command -v ssh >/dev/null 2>&1 || { log_error "需要安装SSH客户端"; exit 1; }
    
    # 检查项目文件
    if [ ! -f "package.json" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    log_success "本地环境检查通过"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 安装依赖
    log_info "安装根目录依赖..."
    npm install
    
    # 构建后端
    log_info "安装后端依赖..."
    cd backend
    npm install --production
    cd ..
    
    # 构建前端
    log_info "构建前端..."
    cd frontend
    npm install
    npm run build
    cd ..
    
    # 生成Prisma客户端
    log_info "生成Prisma客户端..."
    cd backend
    npx prisma generate
    cd ..
    
    log_success "项目构建完成"
}

# 创建部署包
create_deployment_package() {
    log_info "创建部署包..."
    
    # 创建临时目录
    TEMP_DIR=$(mktemp -d)
    PACKAGE_NAME="junyue-spa-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # 复制必要文件
    cp -r backend "$TEMP_DIR/"
    cp -r frontend/dist "$TEMP_DIR/frontend"
    cp -r deploy "$TEMP_DIR/"
    cp package.json "$TEMP_DIR/"
    cp capacitor.config.ts "$TEMP_DIR/"
    
    # 创建压缩包
    cd "$TEMP_DIR"
    tar -czf "/tmp/$PACKAGE_NAME" .
    cd - > /dev/null
    
    # 清理临时目录
    rm -rf "$TEMP_DIR"
    
    echo "/tmp/$PACKAGE_NAME"
    log_success "部署包创建完成: $PACKAGE_NAME"
}

# 上传到服务器
upload_to_server() {
    local package_path=$1
    log_info "上传部署包到服务器..."
    
    # 使用scp上传文件
    scp -o StrictHostKeyChecking=no "$package_path" "$SERVER_USER@$SERVER_IP:/tmp/"
    
    log_success "部署包上传完成"
}

# 服务器部署
deploy_on_server() {
    local package_name=$(basename $1)
    log_info "在服务器上执行部署..."
    
    # SSH到服务器执行部署命令
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << EOF
        set -e
        
        echo "🔧 准备服务器环境..."
        
        # 创建必要目录
        mkdir -p $PROJECT_PATH
        mkdir -p $BACKUP_PATH
        mkdir -p /var/log/junyue
        mkdir -p /var/www/junyue/uploads
        
        # 备份现有部署（如果存在）
        if [ -d "$PROJECT_PATH/backend" ]; then
            echo "📦 备份现有部署..."
            tar -czf "$BACKUP_PATH/backup-\$(date +%Y%m%d-%H%M%S).tar.gz" -C "$PROJECT_PATH" .
        fi
        
        # 解压新部署包
        echo "📂 解压部署包..."
        cd $PROJECT_PATH
        tar -xzf "/tmp/$package_name"
        
        # 设置权限
        chown -R www-data:www-data $PROJECT_PATH
        chmod -R 755 $PROJECT_PATH
        chmod -R 777 /var/www/junyue/uploads
        
        # 安装Node.js依赖（如果需要）
        if ! command -v node &> /dev/null; then
            echo "📦 安装Node.js..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            apt-get install -y nodejs
        fi
        
        # 安装PM2（如果需要）
        if ! command -v pm2 &> /dev/null; then
            echo "📦 安装PM2..."
            npm install -g pm2
        fi
        
        # 安装Nginx（如果需要）
        if ! command -v nginx &> /dev/null; then
            echo "📦 安装Nginx..."
            apt-get update
            apt-get install -y nginx
        fi
        
        # 配置Nginx
        echo "🔧 配置Nginx..."
        cp $PROJECT_PATH/deploy/nginx.conf /etc/nginx/sites-available/junyue.app
        ln -sf /etc/nginx/sites-available/junyue.app /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        # 测试Nginx配置
        nginx -t
        
        # 启动服务
        echo "🚀 启动服务..."
        
        # 启动PM2应用
        cd $PROJECT_PATH
        pm2 delete junyue-spa-api 2>/dev/null || true
        pm2 start deploy/pm2.config.js --env production
        pm2 save
        pm2 startup
        
        # 重启Nginx
        systemctl restart nginx
        systemctl enable nginx
        
        # 清理临时文件
        rm -f "/tmp/$package_name"
        
        echo "✅ 部署完成！"
        echo "🌐 网站地址: https://$DOMAIN"
        echo "📊 API地址: https://api.$DOMAIN"
EOF
    
    log_success "服务器部署完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."
    
    # 等待服务启动
    sleep 10
    
    # 检查API健康状态
    if curl -f -s "http://$SERVER_IP:3000/health" > /dev/null; then
        log_success "API服务运行正常"
    else
        log_warning "API服务可能未正常启动，请检查日志"
    fi
    
    log_info "部署验证完成"
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 君悦彩虹SPA部署完成！"
    echo ""
    echo "📋 部署信息："
    echo "  🌐 网站地址: https://$DOMAIN"
    echo "  📊 API地址: https://api.$DOMAIN"
    echo "  🖥️  服务器IP: $SERVER_IP"
    echo "  📁 项目路径: $PROJECT_PATH"
    echo ""
    echo "🔧 管理命令："
    echo "  查看日志: ssh $SERVER_USER@$SERVER_IP 'pm2 logs junyue-spa-api'"
    echo "  重启服务: ssh $SERVER_USER@$SERVER_IP 'pm2 restart junyue-spa-api'"
    echo "  查看状态: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
    echo ""
    echo "⚠️  注意事项："
    echo "  1. 请配置SSL证书以启用HTTPS"
    echo "  2. 请配置Supabase数据库连接"
    echo "  3. 请配置云够支付参数"
    echo "  4. 请设置域名DNS解析"
}

# 主函数
main() {
    log_info "开始君悦彩虹SPA生产环境部署流程"
    
    check_local_environment
    build_project
    
    package_path=$(create_deployment_package)
    upload_to_server "$package_path"
    deploy_on_server "$package_path"
    verify_deployment
    
    # 清理本地临时文件
    rm -f "$package_path"
    
    show_deployment_info
}

# 执行主函数
main "$@"
