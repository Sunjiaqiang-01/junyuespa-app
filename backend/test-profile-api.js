import express from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// 简化的认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌',
        message: '请先登录'
      });
    }

    console.log('验证token:', token);
    
    // 验证Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('解码后的token:', decoded);
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    console.log('查找到的用户:', user);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: '用户不存在或已禁用',
        message: '请重新登录'
      });
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: user.id,
      role: user.role,
      phone: user.phone,
      nickname: user.nickname
    };

    next();
  } catch (error) {
    console.error('认证失败:', error);
    return res.status(401).json({
      error: 'Token无效',
      message: '请重新登录'
    });
  }
};

// 测试profile API
const testProfileAPI = async (req, res) => {
  try {
    console.log('获取技师资料 - 用户ID:', req.user.userId);
    const userId = req.user.userId;

    const profile = await prisma.technicianProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            phone: true,
            createdAt: true
          }
        }
      }
    });

    console.log('查询到的技师资料:', profile);

    if (!profile) {
      console.log('技师资料不存在，用户ID:', userId);
      return res.status(404).json({
        error: '技师资料不存在',
        message: '请先创建技师资料'
      });
    }

    res.json({
      profile: {
        id: profile.id,
        userId: profile.userId,
        realName: profile.realName,
        age: profile.age,
        height: profile.height,
        weight: profile.weight,
        experience: profile.experience,
        services: profile.services,
        photos: profile.photos,
        city: profile.city,
        district: profile.district,
        rating: profile.rating,
        orderCount: profile.orderCount,
        isVerified: profile.isVerified,
        isAvailable: profile.isAvailable,
        user: profile.user,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      }
    });
  } catch (error) {
    console.error('获取技师资料失败 - 详细错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      error: '获取技师详情失败',
      message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
};

const app = express();
app.use(express.json());

app.get('/test-profile', authMiddleware, testProfileAPI);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`测试服务器启动在端口 ${PORT}`);
});
