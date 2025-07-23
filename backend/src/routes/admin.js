import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import { decryptContactInfo } from '../utils/encryption.js';

const router = express.Router();
const prisma = new PrismaClient();

// 管理员权限中间件
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: '权限不足',
      message: '需要管理员权限'
    });
  }
  next();
};

// 获取所有技师列表（管理员）
router.get('/technicians', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, city } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) {
      where.isVerified = status === 'verified';
    }
    if (city) {
      where.city = city;
    }

    const technicians = await prisma.technicianProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            createdAt: true,
            isActive: true
          }
        },
        _count: {
          select: {
            technicianOrders: true
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.technicianProfile.count({ where });

    res.json({
      technicians: technicians.map(tech => ({
        id: tech.id,
        userId: tech.userId,
        realName: tech.realName,
        phone: tech.user.phone,
        nickname: tech.user.nickname,
        city: tech.city,
        district: tech.district,
        isVerified: tech.isVerified,
        isAvailable: tech.isAvailable,
        isActive: tech.user.isActive,
        orderCount: tech._count.technicianOrders,
        rating: tech.rating,
        createdAt: tech.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取技师列表失败:', error);
    res.status(500).json({
      error: '获取技师列表失败',
      message: '服务器内部错误'
    });
  }
});

// 获取技师详细信息（包含联系方式）
router.get('/technicians/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await prisma.technicianProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            nickname: true,
            createdAt: true,
            isActive: true,
            inviteCode: true
          }
        },
        technicianOrders: {
          include: {
            customer: {
              select: {
                nickname: true,
                phone: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!technician) {
      return res.status(404).json({
        error: '技师不存在',
        message: '找不到指定的技师'
      });
    }

    // 解密订单中的联系方式（仅管理员可见）
    const ordersWithDecryptedContact = technician.technicianOrders.map(order => ({
      ...order,
      contactInfo: decryptContactInfo(order.contactInfo)
    }));

    res.json({
      technician: {
        id: technician.id,
        userId: technician.userId,
        realName: technician.realName,
        gender: technician.gender,
        age: technician.age,
        height: technician.height,
        weight: technician.weight,
        experience: technician.experience,
        services: JSON.parse(technician.services || '[]'),
        photos: JSON.parse(technician.photos || '[]'),
        city: technician.city,
        district: technician.district,
        isVerified: technician.isVerified,
        isAvailable: technician.isAvailable,
        rating: technician.rating,
        orderCount: technician.orderCount,
        user: technician.user,
        recentOrders: ordersWithDecryptedContact
      }
    });

  } catch (error) {
    console.error('获取技师详情失败:', error);
    res.status(500).json({
      error: '获取技师详情失败',
      message: '服务器内部错误'
    });
  }
});

// 审核技师
router.post('/technicians/:id/verify', authMiddleware, adminMiddleware, [
  body('isVerified').isBoolean().withMessage('审核状态必须是布尔值'),
  body('reason').optional().isString().withMessage('审核原因必须是字符串')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isVerified, reason } = req.body;

    const technician = await prisma.technicianProfile.update({
      where: { id: parseInt(id) },
      data: {
        isVerified,
        isAvailable: isVerified, // 审核通过后自动设为可用
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            phone: true,
            nickname: true
          }
        }
      }
    });

    // 这里可以发送通知给技师
    console.log(`技师审核${isVerified ? '通过' : '拒绝'}: ${technician.user.nickname} (${technician.user.phone})`);
    if (reason) {
      console.log(`审核原因: ${reason}`);
    }

    res.json({
      message: `技师审核${isVerified ? '通过' : '拒绝'}`,
      technician: {
        id: technician.id,
        realName: technician.realName,
        isVerified: technician.isVerified,
        isAvailable: technician.isAvailable
      }
    });

  } catch (error) {
    console.error('审核技师失败:', error);
    res.status(500).json({
      error: '审核技师失败',
      message: '服务器内部错误'
    });
  }
});

// 主动联系技师
router.post('/technicians/:id/contact', authMiddleware, adminMiddleware, [
  body('message').notEmpty().withMessage('消息内容不能为空'),
  body('contactMethod').isIn(['phone', 'sms', 'app']).withMessage('联系方式无效'),
  body('urgent').optional().isBoolean().withMessage('紧急标记必须是布尔值')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { message, contactMethod, urgent = false } = req.body;
    const adminId = req.user.userId;

    // 获取技师信息
    const technician = await prisma.technicianProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            nickname: true
          }
        }
      }
    });

    if (!technician) {
      return res.status(404).json({
        error: '技师不存在',
        message: '找不到指定的技师'
      });
    }

    // 创建联系记录
    const contactRecord = await prisma.adminContact.create({
      data: {
        adminId,
        technicianId: technician.userId,
        message,
        contactMethod,
        urgent,
        status: 'SENT',
        createdAt: new Date()
      }
    });

    // 根据联系方式执行相应操作
    let contactResult = '';
    switch (contactMethod) {
      case 'phone':
        contactResult = `已记录电话联系: ${technician.user.phone}`;
        break;
      case 'sms':
        contactResult = `已发送短信到: ${technician.user.phone}`;
        // 这里可以集成短信服务
        break;
      case 'app':
        contactResult = `已发送应用内消息给: ${technician.user.nickname}`;
        // 这里可以集成推送服务
        break;
    }

    console.log(`管理员联系技师: ${technician.user.nickname} (${technician.user.phone})`);
    console.log(`联系方式: ${contactMethod}, 消息: ${message}`);

    res.json({
      message: '联系技师成功',
      contact: {
        id: contactRecord.id,
        technicianName: technician.realName,
        technicianPhone: technician.user.phone,
        contactMethod,
        message,
        urgent,
        result: contactResult,
        createdAt: contactRecord.createdAt
      }
    });

  } catch (error) {
    console.error('联系技师失败:', error);
    res.status(500).json({
      error: '联系技师失败',
      message: '服务器内部错误'
    });
  }
});

// 获取联系记录
router.get('/contacts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, technicianId } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (technicianId) {
      where.technicianId = parseInt(technicianId);
    }

    const contacts = await prisma.adminContact.findMany({
      where,
      include: {
        admin: {
          select: {
            nickname: true
          }
        },
        technician: {
          select: {
            nickname: true,
            technicianProfile: {
              select: {
                realName: true
              }
            }
          }
        }
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.adminContact.count({ where });

    res.json({
      contacts: contacts.map(contact => ({
        id: contact.id,
        adminName: contact.admin.nickname,
        technicianName: contact.technician.technicianProfile?.realName || contact.technician.nickname,
        message: contact.message,
        contactMethod: contact.contactMethod,
        urgent: contact.urgent,
        status: contact.status,
        createdAt: contact.createdAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('获取联系记录失败:', error);
    res.status(500).json({
      error: '获取联系记录失败',
      message: '服务器内部错误'
    });
  }
});

export default router;
