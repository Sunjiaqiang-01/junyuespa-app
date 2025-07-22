import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 认证中间件
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌',
        message: '请先登录'
      });
    }

    // 验证Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

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

// 角色权限中间件
export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: '未认证',
        message: '请先登录'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: '权限不足',
        message: '您没有权限访问此资源'
      });
    }

    next();
  };
};

// 管理员权限中间件
export const adminMiddleware = roleMiddleware(['ADMIN']);

// 技师权限中间件
export const technicianMiddleware = roleMiddleware(['TECHNICIAN', 'ADMIN']);

// 客户权限中间件
export const customerMiddleware = roleMiddleware(['CUSTOMER', 'ADMIN']);
