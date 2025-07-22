import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 获取用户信息
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        technicianProfile: true,
        inviter: {
          select: {
            nickname: true,
            phone: true
          }
        },
        _count: {
          select: {
            invitees: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: '用户不存在'
      });
    }

    res.json({
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        inviteCode: user.inviteCode,
        inviteCount: user._count.invitees,
        inviter: user.inviter,
        technicianProfile: user.technicianProfile,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      error: '获取用户信息失败',
      message: '服务器内部错误'
    });
  }
});

// 获取邀请统计
router.get('/invite-stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 获取邀请人数
    const inviteCount = await prisma.user.count({
      where: { invitedBy: userId }
    });

    // 获取分佣统计
    const commissionStats = await prisma.commission.aggregate({
      where: { 
        userId,
        status: 'PAID'
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    // 计算分佣比例
    let commissionRate = 0;
    if (inviteCount >= 100) {
      commissionRate = 20;
    } else if (inviteCount >= 51) {
      commissionRate = 15;
    } else if (inviteCount >= 11) {
      commissionRate = 12;
    } else if (inviteCount >= 3) {
      commissionRate = 10;
    }

    res.json({
      inviteCount,
      commissionRate,
      totalCommission: commissionStats._sum.amount || 0,
      commissionOrders: commissionStats._count
    });

  } catch (error) {
    console.error('获取邀请统计失败:', error);
    res.status(500).json({
      error: '获取邀请统计失败',
      message: '服务器内部错误'
    });
  }
});

export default router;
