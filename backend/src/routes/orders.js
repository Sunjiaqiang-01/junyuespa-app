import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import { encryptContactInfo, decryptContactInfo, maskContactInfo } from '../utils/encryption.js';

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
        contactInfo: encryptContactInfo(contactInfo), // 加密存储联系方式
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

// 技师确认收到尾款
router.post('/:id/confirm-final-payment', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const technicianUserId = req.user.userId;
    const { finalPaymentMethod, finalPaymentAmount, notes } = req.body;

    // 验证订单
    const order = await prisma.order.findUnique({
      where: {
        id: parseInt(id),
        technicianId: technicianUserId,
        status: 'CONFIRMED' // 只有已确认的订单才能确认尾款
      },
      include: {
        customer: {
          select: {
            nickname: true,
            phone: true
          }
        },
        payments: true
      }
    });

    if (!order) {
      return res.status(400).json({
        error: '订单不存在或状态错误',
        message: '只能确认已接单的订单尾款'
      });
    }

    // 检查是否已确认过尾款
    const existingFinalPayment = order.payments.find(p => p.type === 'FINAL');
    if (existingFinalPayment) {
      return res.status(400).json({
        error: '尾款已确认',
        message: '该订单尾款已经确认过了'
      });
    }

    // 验证尾款金额
    const expectedFinalAmount = order.finalAmount;
    if (finalPaymentAmount && Math.abs(finalPaymentAmount - expectedFinalAmount) > 0.01) {
      return res.status(400).json({
        error: '尾款金额不正确',
        message: `期望金额: ${expectedFinalAmount}元，实际金额: ${finalPaymentAmount}元`
      });
    }

    // 创建尾款支付记录
    const finalPayment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: expectedFinalAmount,
        type: 'FINAL',
        status: 'PAID',
        paymentMethod: finalPaymentMethod || 'CASH',
        paidAt: new Date(),
        transactionId: `FINAL_${order.id}_${Date.now()}`
      }
    });

    // 更新订单状态为已完成
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    // 更新技师统计数据
    await prisma.technicianProfile.update({
      where: { userId: technicianUserId },
      data: {
        orderCount: {
          increment: 1
        }
      }
    });

    console.log(`技师确认尾款: 订单${order.orderNumber}, 金额${expectedFinalAmount}元`);

    res.json({
      message: '尾款确认成功，订单已完成',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        completedAt: updatedOrder.completedAt,
        finalPayment: {
          id: finalPayment.id,
          amount: finalPayment.amount,
          paymentMethod: finalPayment.paymentMethod,
          paidAt: finalPayment.paidAt
        }
      }
    });

  } catch (error) {
    console.error('确认尾款失败:', error);
    res.status(500).json({
      error: '确认尾款失败',
      message: '服务器内部错误'
    });
  }
});

// 获取技师的订单列表
router.get('/technician/orders', authMiddleware, async (req, res) => {
  try {
    const technicianUserId = req.user.userId;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      technicianId: technicianUserId
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
        payments: true
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.order.count({ where });

    // 处理返回数据，脱敏联系方式
    const processedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      serviceType: order.serviceType,
      serviceDuration: order.serviceDuration,
      totalAmount: order.totalAmount,
      depositAmount: order.depositAmount,
      finalAmount: order.finalAmount,
      status: order.status,
      serviceAddress: order.serviceAddress,
      contactInfo: maskContactInfo(decryptContactInfo(order.contactInfo)),
      scheduledTime: order.scheduledTime,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
      customer: order.customer,
      payments: order.payments,
      needsFinalPaymentConfirm: order.status === 'CONFIRMED' && !order.payments.find(p => p.type === 'FINAL')
    }));

    res.json({
      orders: processedOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取技师订单失败:', error);
    res.status(500).json({
      error: '获取技师订单失败',
      message: '服务器内部错误'
    });
  }
});

export default router;
