import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 导入路由
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import technicianRoutes from './routes/technicians.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';

// 加载环境变量
dotenv.config();

// 初始化Prisma客户端
const prisma = new PrismaClient();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// 请求限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '君悦彩虹SPA API服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// API路由
app.get('/api', (req, res) => {
  res.json({
    message: '欢迎使用君悦彩虹SPA API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      technicians: '/api/technicians',
      orders: '/api/orders',
      payments: '/api/payments'
    }
  });
});

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: '接口不存在',
    message: `找不到路径: ${req.originalUrl}`
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 君悦彩虹SPA API服务器启动成功!`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`📚 API文档: http://localhost:${PORT}/api`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('正在关闭服务器...');
  await prisma.$disconnect();
  process.exit(0);
});
