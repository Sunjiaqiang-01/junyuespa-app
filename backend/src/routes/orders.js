import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 生成订单号
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SPA${timestamp}${random}`;
}

// 创建订单
router.post('/', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { 
      technicianId, 
      serviceType, 
      serviceDuration, 
      totalAmount, 
      serviceAddress, 
      contactInfo, 
      scheduledTime 
    } = req.body;

    // 验证技师是否存在且可用
    const technician = await prisma.technicianProfile.findUnique({
      where: { 
        userId: technicianId,
        isVerified: true,
        isAvailable: true
      }
    });

    if (!technician) {
      return res.status(400).json({
        error: '技师不可用',
        message: '选择的技师当前不可预约'
      });
    }

    // 计算定金和尾款（50%各）
    const depositAmount = totalAmount * 0.5;
    const finalAmount = totalAmount * 0.5;

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,
        technicianId,
        serviceType,
        serviceDuration: parseInt(serviceDuration),
        totalAmount: parseFloat(totalAmount),
        depositAmount,
        finalAmount,
        serviceAddress,
        contactInfo, // 这里应该加密存储
        scheduledTime: new Date(scheduledTime),
        status: 'PENDING'
      },
      include: {
        customer: {
          select: {
            nickname: true,
            phone: true
          }
        },
        technician: {
          select: {
            nickname: true
          }
        }
      }
    });

    res.status(201).json({
      message: '订单创建成功',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        serviceType: order.serviceType,
        totalAmount: order.totalAmount,
        depositAmount: order.depositAmount,
        status: order.status,
        scheduledTime: order.scheduledTime,
        customer: order.customer,
        technician: order.technician
      }
    });

  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      error: '创建订单失败',
      message: '服务器内部错误'
    });
  }
});

// 获取用户订单列表
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {
      OR: [
        { customerId: userId },
        { technicianId: userId }
      ]
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            nickname: true,
            phone: true
          }
        },
        technician: {
          select: {
            nickname: true
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      error: '获取订单列表失败',
      message: '服务器内部错误'
    });
  }
});

export default router;
