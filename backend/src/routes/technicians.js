import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { encryptContactInfo, decryptContactInfo, maskContactInfo } from '../utils/encryption.js';

const router = express.Router();
const prisma = new PrismaClient();

// 获取技师列表（公开接口）
router.get('/', [
  query('city').optional().notEmpty().withMessage('城市不能为空'),
  query('page').optional().isInt({ min: 1 }).withMessage('页码必须是正整数'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('每页数量必须在1-50之间'),
  query('search').optional().isLength({ max: 50 }).withMessage('搜索关键词过长')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '参数验证失败',
        details: errors.array()
      });
    }

    const { city, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = {
      isVerified: true,
      isAvailable: true,
      user: {
        isActive: true
      }
    };

    if (city) {
      where.city = city;
    }

    if (search) {
      where.OR = [
        { realName: { contains: search } },
        { services: { contains: search } }
      ];
    }

    // 查询技师列表
    const technicians = await prisma.technicianProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { orderCount: 'desc' }
      ],
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // 获取总数
    const total = await prisma.technicianProfile.count({ where });

    // 处理返回数据（隐藏敏感信息）
    const processedTechnicians = technicians.map(tech => ({
      id: tech.id,
      userId: tech.userId,
      name: tech.realName,
      age: tech.age,
      height: tech.height,
      experience: tech.experience,
      services: JSON.parse(tech.services || '[]'),
      photos: JSON.parse(tech.photos || '[]'),
      city: tech.city,
      district: tech.district,
      rating: tech.rating,
      orderCount: tech.orderCount,
      isAvailable: tech.isAvailable,
      user: tech.user
    }));

    res.json({
      technicians: processedTechnicians,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
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

// 简单测试端点 - 不需要认证（必须在 /:id 路由之前）
router.get('/simple-test', async (req, res) => {
  try {
    console.log('简单测试端点被调用');

    // 测试数据库连接
    const userCount = await prisma.user.count();
    console.log('数据库连接正常，用户总数:', userCount);

    res.json({
      success: true,
      message: '简单测试成功',
      userCount
    });
  } catch (error) {
    console.error('简单测试端点错误:', error);
    res.status(500).json({
      error: '简单测试失败',
      message: error.message
    });
  }
});

// 测试端点 - 验证基本功能（必须在 /:id 路由之前）
router.get('/test', authMiddleware, async (req, res) => {
  try {
    console.log('测试端点被调用，用户ID:', req.user.userId);

    // 测试数据库连接
    const userCount = await prisma.user.count();
    console.log('数据库连接正常，用户总数:', userCount);

    // 测试用户查询
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    console.log('查询到的用户:', user);

    // 测试技师资料查询
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: req.user.userId }
    });
    console.log('查询到的技师资料:', profile ? '存在' : '不存在');

    res.json({
      success: true,
      message: '测试成功',
      data: {
        userId: req.user.userId,
        userExists: !!user,
        profileExists: !!profile,
        userCount
      }
    });
  } catch (error) {
    console.error('测试端点错误:', error);
    res.status(500).json({
      error: '测试失败',
      message: error.message
    });
  }
});

// 获取技师自己的资料（需要认证）
router.get('/profile', authMiddleware, async (req, res) => {
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
      error: '获取技师资料失败',
      message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
    });
  }
});

// 获取技师统计数据（需要认证）
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 获取技师资料
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return res.status(404).json({
        error: '技师资料不存在',
        message: '请先创建技师资料'
      });
    }

    // 获取今日订单数
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.count({
      where: {
        technicianId: profile.id,
        createdAt: {
          gte: today
        }
      }
    });

    // 获取本月收入
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthIncomeResult = await prisma.order.aggregate({
      where: {
        technicianId: profile.id,
        status: 'COMPLETED',
        createdAt: {
          gte: thisMonth
        }
      },
      _sum: {
        totalAmount: true
      }
    });

    const stats = {
      todayOrders,
      monthIncome: monthIncomeResult._sum.totalAmount || 0,
      totalOrders: profile.orderCount,
      rating: profile.rating
    };

    res.json({ stats });

  } catch (error) {
    console.error('获取技师统计数据失败:', error);
    res.status(500).json({
      error: '获取统计数据失败',
      message: '服务器内部错误'
    });
  }
});

// 获取技师详情（公开接口，但隐藏联系方式）
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await prisma.technicianProfile.findUnique({
      where: { 
        id: parseInt(id),
        isVerified: true,
        isAvailable: true
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
            createdAt: true
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

    // 处理返回数据（隐藏敏感信息）
    const processedTechnician = {
      id: technician.id,
      userId: technician.userId,
      name: technician.realName,
      age: technician.age,
      height: technician.height,
      weight: technician.weight,
      experience: technician.experience,
      services: JSON.parse(technician.services || '[]'),
      photos: JSON.parse(technician.photos || '[]'),
      city: technician.city,
      district: technician.district,
      rating: technician.rating,
      orderCount: technician.orderCount,
      isAvailable: technician.isAvailable,
      user: technician.user
    };

    res.json({
      technician: processedTechnician
    });

  } catch (error) {
    console.error('获取技师详情失败:', error);
    res.status(500).json({
      error: '获取技师详情失败',
      message: '服务器内部错误'
    });
  }
});

// 技师注册资料（需要认证）
router.post('/profile', authMiddleware, [
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('age').isInt({ min: 18, max: 60 }).withMessage('年龄必须在18-60之间'),
  body('height').optional().matches(/^\d{2,3}cm$/).withMessage('身高格式错误'),
  body('weight').optional().matches(/^\d{2,3}kg$/).withMessage('体重格式错误'),
  body('experience').optional().isLength({ max: 500 }).withMessage('经验描述过长'),
  body('services').isArray().withMessage('服务项目必须是数组'),
  body('city').notEmpty().withMessage('城市不能为空'),
  body('district').optional().notEmpty().withMessage('区域不能为空')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const { realName, gender, age, height, weight, experience, services, city, district } = req.body;

    // 检查用户角色
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user.role !== 'TECHNICIAN') {
      return res.status(403).json({
        error: '权限不足',
        message: '只有技师角色可以创建技师资料'
      });
    }

    // 检查是否已有技师资料
    const existingProfile = await prisma.technicianProfile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return res.status(400).json({
        error: '技师资料已存在',
        message: '您已经创建过技师资料'
      });
    }

    // 创建技师资料
    const profile = await prisma.technicianProfile.create({
      data: {
        userId,
        realName,
        gender,
        age: parseInt(age),
        height,
        weight,
        experience,
        services: JSON.stringify(services),
        photos: JSON.stringify([]), // 初始为空，后续上传照片
        city,
        district,
        isVerified: false, // 需要管理员审核
        isAvailable: false
      }
    });

    res.status(201).json({
      message: '技师资料创建成功，等待管理员审核',
      profile: {
        id: profile.id,
        realName: profile.realName,
        age: profile.age,
        city: profile.city,
        isVerified: profile.isVerified
      }
    });

  } catch (error) {
    console.error('创建技师资料失败:', error);
    res.status(500).json({
      error: '创建技师资料失败',
      message: '服务器内部错误'
    });
  }
});

// 获取城市列表
router.get('/cities/list', async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ province: 'asc' }, { name: 'asc' }]
    });

    // 按省份分组
    const citiesByProvince = cities.reduce((acc, city) => {
      if (!acc[city.province]) {
        acc[city.province] = [];
      }
      acc[city.province].push({
        id: city.id,
        name: city.name,
        province: city.province
      });
      return acc;
    }, {});

    // 热门城市（直辖市和主要城市）
    const hotCities = cities.filter(city =>
      ['北京市', '上海市', '天津市', '重庆市'].includes(city.province) ||
      ['广州', '深圳', '杭州', '成都', '西安', '武汉', '南京', '苏州', '青岛', '大连'].includes(city.name)
    ).map(city => ({
      id: city.id,
      name: city.name,
      province: city.province
    }));

    res.json({
      hotCities,
      citiesByProvince,
      allCities: cities.map(city => ({
        id: city.id,
        name: city.name,
        province: city.province
      }))
    });

  } catch (error) {
    console.error('获取城市列表失败:', error);
    res.status(500).json({
      error: '获取城市列表失败',
      message: '服务器内部错误'
    });
  }
});

// 更新技师资料（需要认证）
router.put('/profile', authMiddleware, [
  body('realName').notEmpty().withMessage('真实姓名不能为空'),
  body('age').isInt({ min: 18, max: 60 }).withMessage('年龄必须在18-60之间'),
  body('height').optional().matches(/^\d{2,3}cm$/).withMessage('身高格式错误'),
  body('weight').optional().matches(/^\d{2,3}kg$/).withMessage('体重格式错误'),
  body('experience').optional().isLength({ max: 500 }).withMessage('经验描述过长'),
  body('services').isArray().withMessage('服务项目必须是数组'),
  body('city').notEmpty().withMessage('城市不能为空'),
  body('district').optional().notEmpty().withMessage('区域不能为空')
], async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '输入验证失败',
        details: errors.array()
      });
    }

    const userId = req.user.userId;
    const { realName, gender, age, height, weight, experience, services, city, district, photos, isAvailable } = req.body;

    // 检查技师资料是否存在
    const existingProfile = await prisma.technicianProfile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      return res.status(404).json({
        error: '技师资料不存在',
        message: '请先创建技师资料'
      });
    }

    // 更新技师资料
    const updatedProfile = await prisma.technicianProfile.update({
      where: { userId },
      data: {
        realName,
        gender,
        age: parseInt(age),
        height,
        weight,
        experience,
        services: JSON.stringify(services),
        photos: JSON.stringify(photos || []),
        city,
        district,
        isAvailable: isAvailable !== undefined ? isAvailable : existingProfile.isAvailable,
        updatedAt: new Date()
      }
    });

    res.json({
      message: '技师资料更新成功',
      profile: {
        id: updatedProfile.id,
        realName: updatedProfile.realName,
        age: updatedProfile.age,
        city: updatedProfile.city,
        isVerified: updatedProfile.isVerified,
        isAvailable: updatedProfile.isAvailable
      }
    });

  } catch (error) {
    console.error('更新技师资料失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    res.status(500).json({
      error: '更新技师资料失败',
      message: '服务器内部错误',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
