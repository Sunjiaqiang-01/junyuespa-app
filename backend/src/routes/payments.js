import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import yunGouPayment from '../services/yunGouPayment.js';

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

    // 调用云够支付API创建支付订单
    const paymentResult = await yunGouPayment.createPayment({
      outTradeNo: `SPA_${payment.id}_${Date.now()}`,
      totalFee: yunGouPayment.yuanToFen(order.depositAmount),
      body: `君悦SPA服务定金-订单${order.orderNumber}`,
      attach: JSON.stringify({
        paymentId: payment.id,
        orderId: order.id,
        type: 'DEPOSIT'
      })
    });

    if (paymentResult.success) {
      // 更新支付记录的外部交易号
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transactionId: paymentResult.data.outTradeNo
        }
      });

      res.json({
        message: '支付订单创建成功',
        payment: {
          id: payment.id,
          amount: payment.amount,
          type: payment.type,
          status: payment.status,
          paymentUrl: paymentResult.data.paymentUrl,
          qrCode: paymentResult.data.qrCode,
          outTradeNo: paymentResult.data.outTradeNo
        }
      });
    } else {
      // 支付创建失败，删除支付记录
      await prisma.payment.delete({
        where: { id: payment.id }
      });

      return res.status(500).json({
        error: '创建支付订单失败',
        message: paymentResult.error
      });
    }

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
    console.log('收到云够支付回调:', req.body);

    // 验证云够支付的签名
    const callbackResult = yunGouPayment.handleCallback(req.body);

    if (!callbackResult.success) {
      console.error('回调验证失败:', callbackResult.error);
      return res.status(400).json({ error: callbackResult.error });
    }

    const { outTradeNo, transactionId, totalFee, attach } = callbackResult.data;

    // 解析附加数据
    let attachData;
    try {
      attachData = JSON.parse(attach);
    } catch (e) {
      console.error('解析附加数据失败:', e);
      return res.status(400).json({ error: '附加数据格式错误' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: attachData.paymentId },
      include: { order: true }
    });

    if (!payment) {
      return res.status(400).json({ error: '支付记录不存在' });
    }

    // 检查金额是否匹配
    const expectedAmount = yunGouPayment.yuanToFen(payment.amount);
    if (totalFee !== expectedAmount) {
      console.error('支付金额不匹配:', { expected: expectedAmount, actual: totalFee });
      return res.status(400).json({ error: '支付金额不匹配' });
    }

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

    // 返回成功响应（云够支付要求返回特定格式）
    res.send('SUCCESS');

  } catch (error) {
    console.error('支付回调处理失败:', error);
    res.status(500).send('FAIL');
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

    const inviter = customer.inviter;
    const inviteCount = inviter._count.invitees;

    // 检查是否是代理用户
    const isAgent = await checkAgentStatus(inviter.id);

    let commissionRate = 0;
    let commissionType = 'CUSTOMER_INVITE';

    if (isAgent) {
      // 代理分佣机制（最高40%）
      commissionRate = await getAgentCommissionRate(inviter.id, inviteCount);
      commissionType = 'AGENT_COMMISSION';
    } else {
      // 普通用户阶梯分佣
      if (inviteCount >= 100) {
        commissionRate = 0.20;
      } else if (inviteCount >= 51) {
        commissionRate = 0.15;
      } else if (inviteCount >= 11) {
        commissionRate = 0.12;
      } else if (inviteCount >= 3) {
        commissionRate = 0.10;
      }
    }

    if (commissionRate > 0) {
      const commissionAmount = order.depositAmount * commissionRate;

      // 创建分佣记录
      await prisma.commission.create({
        data: {
          userId: inviter.id,
          orderId: order.id,
          amount: commissionAmount,
          percentage: commissionRate * 100,
          type: commissionType,
          status: 'PENDING',
          level: 1
        }
      });

      console.log(`创建分佣记录: 用户${inviter.id}, 金额${commissionAmount}, 比例${commissionRate * 100}%`);
    }

  } catch (error) {
    console.error('计算分佣失败:', error);
  }
}

// 检查代理状态
async function checkAgentStatus(userId) {
  try {
    // 这里可以从数据库查询用户的代理状态
    // 暂时通过用户角色或特殊标记判断
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, nickname: true }
    });

    // 如果用户角色包含AGENT或昵称包含"代理"，则认为是代理
    return user && (
      user.role === 'AGENT' ||
      user.nickname?.includes('代理') ||
      user.nickname?.includes('AGENT')
    );
  } catch (error) {
    console.error('检查代理状态失败:', error);
    return false;
  }
}

// 获取代理分佣比例
async function getAgentCommissionRate(userId, inviteCount) {
  try {
    // 代理分佣阶梯（最高40%）
    if (inviteCount >= 500) {
      return 0.40; // 40% - 超级代理
    } else if (inviteCount >= 200) {
      return 0.35; // 35% - 高级代理
    } else if (inviteCount >= 100) {
      return 0.30; // 30% - 中级代理
    } else if (inviteCount >= 50) {
      return 0.25; // 25% - 初级代理
    } else {
      return 0.20; // 20% - 基础代理
    }
  } catch (error) {
    console.error('获取代理分佣比例失败:', error);
    return 0.20; // 默认20%
  }
}

export default router;
