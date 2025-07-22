import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 生成邀请码
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 生成JWT Token
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// 用户注册
router.post('/register', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('role').isIn(['CUSTOMER', 'TECHNICIAN']).withMessage('角色类型错误'),
  body('inviteCode').optional().isLength({ min: 6, max: 6 }).withMessage('邀请码格式错误')
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

    const { phone, password, role, inviteCode, nickname } = req.body;

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return res.status(400).json({
        error: '手机号已注册',
        message: '该手机号已经注册过账户'
      });
    }

    // 验证邀请码（如果提供）
    let inviterId = null;
    if (inviteCode) {
      const inviter = await prisma.user.findUnique({
        where: { inviteCode }
      });
      
      if (!inviter) {
        return res.status(400).json({
          error: '邀请码无效',
          message: '请检查邀请码是否正确'
        });
      }
      inviterId = inviter.id;
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));

    // 生成唯一邀请码
    let userInviteCode;
    do {
      userInviteCode = generateInviteCode();
      const existing = await prisma.user.findUnique({
        where: { inviteCode: userInviteCode }
      });
      if (!existing) break;
    } while (true);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone,
        passwordHash,
        role,
        nickname: nickname || `用户${phone.slice(-4)}`,
        inviteCode: userInviteCode,
        invitedBy: inviterId
      }
    });

    // 生成Token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        inviteCode: user.inviteCode
      },
      token
    });

  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      error: '注册失败',
      message: '服务器内部错误'
    });
  }
});

// 用户登录
router.post('/login', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入正确的手机号'),
  body('password').notEmpty().withMessage('请输入密码')
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

    const { phone, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        technicianProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: '登录失败',
        message: '手机号或密码错误'
      });
    }

    // 检查账户状态
    if (!user.isActive) {
      return res.status(401).json({
        error: '账户已禁用',
        message: '请联系客服处理'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '登录失败',
        message: '手机号或密码错误'
      });
    }

    // 生成Token
    const token = generateToken(user.id, user.role);

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        inviteCode: user.inviteCode,
        technicianProfile: user.technicianProfile
      },
      token
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      error: '登录失败',
      message: '服务器内部错误'
    });
  }
});

// 验证Token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '未提供认证令牌',
        message: '请先登录'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        technicianProfile: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: '用户不存在或已禁用',
        message: '请重新登录'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        inviteCode: user.inviteCode,
        technicianProfile: user.technicianProfile
      }
    });

  } catch (error) {
    console.error('Token验证失败:', error);
    res.status(401).json({
      error: 'Token无效',
      message: '请重新登录'
    });
  }
});

export default router;
