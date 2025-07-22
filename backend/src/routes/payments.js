import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 创建支付订单（定金）
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    // 验证订单
    const order = await prisma.order.findUnique({
      where: { 
        id: parseInt(orderId),
        customerId: userId,
        status: 'PENDING'
      }
    });

    if (!order) {
      return res.status(400).json({
        error: '订单不存在或状态错误'
      });
    }

    // 检查是否已有支付记录
    const existingPayment = await prisma.payment.findFirst({
      where: {
        orderId: order.id,
        type: 'DEPOSIT'
      }
    });

    if (existingPayment) {
      return res.status(400).json({
        error: '该订单已创建支付记录'
      });
    }

    // 创建支付记录
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.depositAmount,
        type: 'DEPOSIT',
        status: 'PENDING',
        paymentMethod: 'YUNGOU' // 云够支付
      }
    });

    // 这里应该调用云够支付API创建支付订单
    // 暂时返回模拟的支付信息
    res.json({
      message: '支付订单创建成功',
      payment: {
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        // 实际应用中这里会返回支付链接或二维码
        paymentUrl: `https://pay.yungouos.com/api/pay?order=${payment.id}`,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
      }
    });

  } catch (error) {
    console.error('创建支付订单失败:', error);
    res.status(500).json({
      error: '创建支付订单失败',
      message: '服务器内部错误'
    });
  }
});

// 支付回调（云够支付回调）
router.post('/callback/yungou', async (req, res) => {
  try {
    // 这里应该验证云够支付的签名
    const { orderId, status, transactionId } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(orderId) },
      include: { order: true }
    });

    if (!payment) {
      return res.status(400).json({ error: '支付记录不存在' });
    }

    if (status === 'SUCCESS') {
      // 更新支付状态
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          transactionId,
          paidAt: new Date()
        }
      });

      // 更新订单状态
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      });

      // 计算和创建分佣记录
      await calculateCommission(payment.order);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).json({ error: '回调处理失败' });
  }
});

// 计算分佣
async function calculateCommission(order) {
  try {
    // 获取客户的邀请者
    const customer = await prisma.user.findUnique({
      where: { id: order.customerId },
      include: {
        inviter: {
          include: {
            _count: {
              select: { invitees: true }
            }
          }
        }
      }
    });

    if (!customer.inviter) return; // 没有邀请者，无分佣

    const inviteCount = customer.inviter._count.invitees;
    let commissionRate = 0;

    // 计算分佣比例
    if (inviteCount >= 100) {
      commissionRate = 0.20;
    } else if (inviteCount >= 51) {
      commissionRate = 0.15;
    } else if (inviteCount >= 11) {
      commissionRate = 0.12;
    } else if (inviteCount >= 3) {
      commissionRate = 0.10;
    }

    if (commissionRate > 0) {
      const commissionAmount = order.depositAmount * commissionRate;

      // 创建分佣记录
      await prisma.commission.create({
        data: {
          userId: customer.inviter.id,
          orderId: order.id,
          amount: commissionAmount,
          percentage: commissionRate * 100,
          type: 'CUSTOMER_INVITE',
          status: 'PENDING',
          level: 1
        }
      });
    }

  } catch (error) {
    console.error('计算分佣失败:', error);
  }
}

export default router;
