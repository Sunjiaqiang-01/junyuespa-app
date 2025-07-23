---
trigger: always
description: "项目背景和上下文 - 基础项目信息"
---

# 项目背景和上下文

## 项目基本信息
- **项目名称**：君悦彩虹SPA移动应用
- **项目类型**：三端应用（客户端、技师端、管理端）
- **目标用户**：中国境内SPA服务消费者
- **官方域名**：junyue.app
- **服务器IP**：154.23.181.173

## 技术架构
- **前端框架**：React + Vite
- **UI组件库**：Antd Mobile
- **后端框架**：Node.js + Express
- **数据库ORM**：Prisma
- **数据库**：开发环境SQLite，生产环境Supabase
- **移动端打包**：Capacitor
- **部署方案**：Nginx + PM2
- **开发环境**：VS Code + Augment

## 部署环境
- **服务器提供商**：华纳云香港
- **服务器配置**：2核4GB 5M带宽
- **操作系统**：Ubuntu 22.04 LTS
- **域名**：junyue.app
- **SSL证书**：Let's Encrypt

## 项目目录结构
```
junyuespa-app/
├── frontend/          # React前端应用
├── backend/           # Node.js后端API
├── mobile/            # Capacitor移动端配置
├── docs/              # 项目文档
├── .augment/          # Augment配置
└── README.md          # 项目说明
```

## 开发状态
- **当前阶段**：开发完成，准备部署
- **已完成功能**：用户认证、技师管理、订单系统、支付集成
- **待优化项目**：性能优化、安全加固、用户体验改进
