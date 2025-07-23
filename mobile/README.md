# 君悦彩虹SPA移动端

## 📱 移动端配置

### 技术栈
- **Capacitor** - 跨平台移动应用框架
- **Android** - 原生Android应用
- **iOS** - 原生iOS应用

### 构建命令

#### 开发环境
```bash
# 启动前后端开发服务器
npm run dev

# 仅启动前端
npm run dev:frontend

# 仅启动后端
npm run dev:backend
```

#### 构建应用
```bash
# 构建前端并同步到移动端
npm run build

# 构建Android应用
npm run build:android

# 构建iOS应用
npm run build:ios

# 同步代码到移动端
npm run sync
```

#### 打开IDE
```bash
# 打开Android Studio
npm run open:android

# 打开Xcode
npm run open:ios
```

### 应用配置

#### 应用信息
- **应用ID**: com.junyue.spa
- **应用名称**: 君悦彩虹SPA
- **版本**: 1.0.0

#### 功能特性
- 🔒 防复制保护
- 📱 响应式设计
- 🎨 原生UI体验
- 🔔 推送通知支持
- 📷 相机和相册访问
- 🌐 网络状态检测

### 部署流程

#### Android部署
1. 构建应用：`npm run build:android`
2. 打开Android Studio：`npm run open:android`
3. 连接设备或启动模拟器
4. 点击运行按钮进行安装测试
5. 生成签名APK用于发布

#### iOS部署
1. 构建应用：`npm run build:ios`
2. 打开Xcode：`npm run open:ios`
3. 配置开发者证书
4. 连接iOS设备
5. 运行应用进行测试
6. 提交到App Store或TestFlight

### 注意事项

#### 开发要求
- Node.js 18+
- Android Studio (Android开发)
- Xcode (iOS开发，仅macOS)
- Java 11+ (Android构建)

#### 权限配置
应用需要以下权限：
- 网络访问
- 相机访问
- 相册访问
- 文件存储
- 推送通知

#### 安全配置
- 启用HTTPS
- 配置网络安全策略
- 防止调试和逆向工程
- 数据加密存储

### 常见问题

#### 构建失败
1. 检查Node.js版本
2. 清理node_modules重新安装
3. 检查Android/iOS开发环境

#### 同步失败
1. 确保前端已构建：`npm run build:frontend`
2. 手动同步：`npm run sync`
3. 检查capacitor.config.ts配置

#### 设备调试
1. 启用开发者模式
2. 允许USB调试
3. 信任开发证书

### 发布准备

#### Android发布
- 生成签名密钥
- 配置ProGuard混淆
- 优化APK大小
- 测试不同设备

#### iOS发布
- 配置App Store证书
- 准备应用截图
- 填写应用描述
- 提交审核

---

**开发团队**: 君悦彩虹SPA
**技术支持**: 通过GitHub Issues反馈问题
