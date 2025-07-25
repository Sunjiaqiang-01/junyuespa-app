# 君悦彩虹SPA移动应用

> 基于现有网站开发的三端移动应用，提供SPA技师预约服务

[![开发进度](https://img.shields.io/badge/开发进度-开发中-green)]()
[![技术栈](https://img.shields.io/badge/技术栈-React%20%2B%20Node.js-blue)]()
[![部署](https://img.shields.io/badge/部署-华纳云香港-green)]()
[![域名](https://img.shields.io/badge/域名-junyue.app-blue)](https://junyue.app)
[![服务器](https://img.shields.io/badge/服务器-154.23.181.173-green)]()

## 🚀 项目概述

### 基本信息
- **项目类型**：三端应用（客户端、技师端、管理端）
- **核心特色**：分阶段支付 + 阶梯分佣 + 防复制保护
- **技术栈**：React + Node.js + SQLite/Supabase + VS Code + Augment
- **目标用户**：中国境内SPA服务消费者
- **官方域名**：[junyue.app](https://junyue.app)
- **服务器IP**：154.23.181.173

### 主要功能
- **客户端**：技师浏览、预约下单、分阶段支付、邀请分佣
- **技师端**：接单管理、收款确认、邀请新用户
- **管理端**：技师审核、订单监控、用户管理、主动联系技师

## 💼 核心业务模式

### 支付流程
```
客户下单 → 支付50%定金(平台) → 技师接单 → 服务完成 → 客户直接付50%给技师 → 订单完成
```

### 💰 阶梯分佣机制
- **邀请门槛**：客户邀请3人以上开始享受分佣
- **阶梯分佣**：
  - 3-10人：10%分佣
  - 11-50人：12%分佣
  - 51-100人：15%分佣
  - 100人以上：20%分佣
- **代理合作**：大客户资源可申请代理，最高40%分佣
- **技师双重身份**：技师可注册用户端，通过用户端邀请客户获得分佣

### 🔒 安全保护
- **联系方式保护**：技师联系方式加密存储，前端不显示
- **防复制设计**：技师详情页禁用复制、长按、截图功能
- **权限控制**：客户、技师、管理员三种角色权限严格区分

## 📋 开发进度

### 当前状态：✅ 核心功能开发完成，准备生产部署
- [x] 项目规划和需求分析
- [x] 技术架构设计
- [x] 开发环境配置
- [x] 数据库设计
- [x] API接口设计
- [x] 核心功能开发
- [x] 安全防护实现
- [x] 移动端配置
- [ ] 生产环境部署
- [ ] 性能优化测试

### 🎯 开发完成情况

#### ✅ 第一阶段：核心功能（已完成）
- ✅ 用户注册/登录系统（支持邀请码）
- ✅ 技师浏览和详情页（全国城市筛选）
- ✅ 预约下单功能
- ✅ 云够支付集成（50%定金）
- ✅ 基础管理后台

#### ✅ 第二阶段：高级功能（已完成）
- ✅ 阶梯分佣系统
- ✅ 技师端应用开发
- ✅ 管理员通信功能
- ✅ 防复制保护实现
- ✅ 代理分佣机制（最高40%）
- ✅ 尾款确认机制

#### ✅ 第三阶段：移动端部署（已完成）
- ✅ Capacitor双平台打包（Android + iOS）
- ✅ 移动端配置和构建脚本
- ✅ 安全防护增强
- ✅ 项目结构完善

#### 🚀 下一阶段：生产部署
- [ ] 服务器环境配置
- [ ] 域名SSL证书配置
- [ ] 数据库迁移到Supabase
- [ ] 性能监控和日志系统
- [ ] 自动化部署流程

## ⚡ 核心功能模块

### 客户端功能
- **技师浏览**：全国城市筛选、搜索排序、详情查看
- **预约下单**：选择技师、时间、地址，在线预约
- **分阶段支付**：50%定金通过平台，50%尾款直付技师
- **邀请分佣**：生成邀请码，享受阶梯分佣收益
- **客服联系**：联系平台客服解决问题

### 技师端功能
- **简化注册**：基本信息填写，快速审核通过
- **订单管理**：接单/拒单，状态更新，收款确认
- **双重身份**：可注册用户端，邀请客户获得分佣
- **收入统计**：查看日/月收入和订单统计

### 管理端功能
- **技师管理**：审核、信息编辑、状态管理
- **订单监控**：实时监控、异常处理、数据统计
- **用户管理**：用户信息查看、状态管理、分佣记录
- **主动通信**：联系技师、群发通知、紧急消息

## 🛠️ 技术架构

### 技术选型
| 层级 | 技术选择 | 选择理由 |
|------|----------|----------|
| 前端 | React + Vite | 学习成本低，AI辅助友好 |
| 后端 | Node.js + Express | JavaScript全栈，简单易学 |
| 数据库 | SQLite(开发) + Supabase(生产) + Prisma | 开发简单，生产稳定，类型安全 |
| 状态管理 | Zustand | 比Redux简单，易于理解 |
| UI组件 | Ant Design Mobile | 现成组件，快速开发 |
| 地图服务 | 高德地图API | 免费，适合国内用户 |
| 支付服务 | 云够支付(YunGouOS) | 支持个人开发者，海外部署 |
| 移动端 | Capacitor | Web应用转移动应用 |

### 项目结构
```
junyuespa-app/
├── frontend/           # React前端应用
│   ├── src/
│   │   ├── components/ # 可复用组件
│   │   ├── pages/      # 页面组件
│   │   ├── stores/     # Zustand状态管理
│   │   ├── services/   # API服务调用
│   │   └── utils/      # 工具函数
│   └── package.json
├── backend/            # Node.js后端API
│   ├── src/
│   │   ├── routes/     # API路由
│   │   ├── models/     # 数据模型
│   │   ├── services/   # 业务逻辑
│   │   ├── middleware/ # 中间件
│   │   └── utils/      # 工具函数
│   ├── prisma/         # 数据库schema
│   └── package.json
├── mobile/             # Capacitor移动端
├── .augmentrules       # AI开发规则
└── README.md           # 项目说明
```

### 核心技术实现

#### 💳 分阶段支付系统 ✅
- **定金支付**：✅ 集成云够支付API，处理50%定金
- **尾款确认**：✅ 技师手动确认收到50%尾款
- **订单状态**：✅ 自动更新订单状态和支付记录
- **支付回调**：✅ 安全的支付回调验证机制

#### 💰 阶梯分佣系统 ✅
- **邀请追踪**：✅ 记录邀请关系和邀请数量
- **自动计算**：✅ 根据邀请人数自动计算分佣比例
- **分佣分配**：✅ 从定金中自动扣除和分配分佣
- **代理机制**：✅ 支持代理分佣，最高40%

#### 🔒 安全保护机制 ✅
- **数据加密**：✅ 技师联系方式AES加密存储
- **防复制技术**：✅ 禁用复制、长按、截图等操作
- **权限控制**：✅ 严格的用户角色权限管理
- **XSS防护**：✅ 输入验证和输出转义
- **CSRF防护**：✅ 请求来源验证
- **SQL注入防护**：✅ 参数化查询保护

#### 📱 双平台部署 ✅
- **Android**：✅ Capacitor打包APK，直接分发
- **iOS**：✅ 企业签名或TestFlight内测分发
- **兼容性**：✅ 确保两平台功能完全一致
- **构建脚本**：✅ 自动化构建和部署脚本

## 🚀 开发环境

### 环境要求
- VS Code + Augment插件
- Node.js 18+
- SQLite（开发）+ Supabase（生产）

### 本地开发启动
```bash
# 克隆项目
git clone https://github.com/Sunjiaqiang-01/junyuespa-app.git
cd junyuespa-app

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install

# 初始化数据库
npx prisma generate && npx prisma db push

# 启动开发服务器
npm run dev
```

### 服务器部署
```bash
# 连接服务器
ssh root@154.23.181.173

# 安装Node.js和PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs
npm install -g pm2

# 安装Nginx
apt update && apt install -y nginx

# 克隆项目到服务器
git clone https://github.com/Sunjiaqiang-01/junyuespa-app.git /var/www/junyue.app
cd /var/www/junyue.app

# 构建和启动应用
cd frontend && npm install && npm run build
cd ../backend && npm install && npm run build
pm2 start ecosystem.config.js

# 配置Nginx和SSL
# 详见部署文档
```

### VS Code插件
- Augment（AI助手）
- ES7+ React snippets
- Prettier + ESLint

## 📦 部署方案

### 生产环境
- **域名**：[junyue.app](https://junyue.app)
- **服务器**：华纳云 2核4GB 5M带宽 (154.23.181.173)
- **操作系统**：Ubuntu 22.04 LTS
- **Web服务器**：Nginx + PM2
- **数据库**：Supabase（免费PostgreSQL云服务）
- **SSL证书**：Let's Encrypt 免费证书
- **CDN加速**：Cloudflare（可选）

### 部署架构
```
用户访问 → Cloudflare CDN → Nginx反向代理 → Node.js应用 → Supabase数据库
         ↓
    junyue.app (HTTPS)
```

### 应用分发
- **Web版**：https://junyue.app （响应式设计，支持移动端）
- **Android APK**：https://junyue.app/download/android
- **iOS TestFlight**：https://junyue.app/download/ios

## ⚠️ 重要提醒

### 核心业务规则
- 🔒 **联系方式保护**：技师联系方式加密存储，前端不显示
- 💰 **分阶段支付**：50%定金给平台，50%尾款客户直付技师
- � **阶梯分佣**：3人起步，最高20%，代理最高40%
- 📱 **双平台支持**：Android和iOS功能完全一致
- ⚖️ **合规要求**：分佣机制符合法规，避免传销风险

### 技术关键点
- **全国城市支持**：省市二级联动筛选
- **防复制保护**：禁用复制、长按、截图功能
- **权限控制**：客户、技师、管理员三种角色严格区分
- **双重身份**：技师可注册用户端进行邀请分佣
- **AI辅助开发**：使用Augment插件提高开发效率

### 安全要求
- 所有API接口必须验证用户权限
- 敏感数据加密存储，定期备份
- 支付流程严格按照50%+50%模式
- 分佣计算准确，防止虚假邀请

## 🎉 项目状态

- **当前版本**：v1.0-release-candidate
- **开发状态**：✅ 核心功能开发完成，准备生产部署
- **最后更新**：2025年1月23日
- **完成度**：95% - 核心功能全部完成
- **下一步**：生产环境部署和性能优化

## 🌐 访问地址

### 生产环境
- **主站**：https://junyue.app
- **管理后台**：https://junyue.app/admin
- **API接口**：https://junyue.app/api
- **技师端**：https://junyue.app/technician
- **客户端**：https://junyue.app/client

### 开发环境
- **本地前端**：http://localhost:3000
- **本地后端**：http://localhost:3001
- **本地API文档**：http://localhost:3001/docs

## 📞 联系信息

- **项目负责人**：[您的信息]
- **官方域名**：junyue.app
- **服务器提供商**：华纳云香港
- **开发工具**：VS Code + Augment AI助手
- **技术支持**：通过GitHub Issues或官网联系

---

**开发原则**：简单实用，安全合规，AI辅助，快速迭代
