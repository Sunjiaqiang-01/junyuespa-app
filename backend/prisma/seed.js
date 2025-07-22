import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { citiesData } from '../data/cities.js';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据...');

  // 创建全国城市数据
  console.log(`准备创建 ${citiesData.length} 个城市数据...`);

  for (const city of citiesData) {
    const existingCity = await prisma.city.findFirst({
      where: { name: city.name }
    });

    if (!existingCity) {
      await prisma.city.create({
        data: {
          name: city.name,
          province: city.province,
          isActive: true
        }
      });
    }
  }

  console.log('城市数据创建完成');

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      phone: '13800000000',
      passwordHash: adminPassword,
      role: 'ADMIN',
      nickname: '系统管理员',
      inviteCode: 'ADMIN001',
      isActive: true
    }
  });

  console.log('管理员用户创建完成');

  // 创建技师用户和资料
  const technicians = [
    {
      phone: '13800000001',
      nickname: '小雅',
      realName: '小雅',
      age: 25,
      height: '165cm',
      weight: '50kg',
      experience: '5年专业SPA经验，擅长全身按摩和精油护理',
      services: ['全身按摩', 'SPA护理', '足疗', '精油按摩'],
      city: '北京',
      district: '朝阳区'
    },
    {
      phone: '13800000002',
      nickname: '小美',
      realName: '小美',
      age: 28,
      height: '168cm',
      weight: '52kg',
      experience: '7年专业经验，精通深度按摩和肩颈护理',
      services: ['深度按摩', '精油SPA', '肩颈护理', '淋巴排毒'],
      city: '北京',
      district: '海淀区'
    },
    {
      phone: '13800000003',
      nickname: '小琳',
      realName: '小琳',
      age: 26,
      height: '162cm',
      weight: '48kg',
      experience: '6年泰式按摩经验，热石SPA专家',
      services: ['泰式按摩', '热石SPA', '淋巴排毒', '面部护理'],
      city: '上海',
      district: '浦东新区'
    },
    {
      phone: '13800000004',
      nickname: '小慧',
      realName: '小慧',
      age: 24,
      height: '160cm',
      weight: '46kg',
      experience: '4年专业经验，擅长放松按摩',
      services: ['放松按摩', '精油护理', '足底按摩', 'SPA护理'],
      city: '广州',
      district: '天河区'
    }
  ];

  for (const tech of technicians) {
    const password = await bcrypt.hash('123456', 12);
    
    // 生成邀请码
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const user = await prisma.user.upsert({
      where: { phone: tech.phone },
      update: {},
      create: {
        phone: tech.phone,
        passwordHash: password,
        role: 'TECHNICIAN',
        nickname: tech.nickname,
        inviteCode: inviteCode,
        isActive: true
      }
    });

    // 创建技师资料
    await prisma.technicianProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        realName: tech.realName,
        age: tech.age,
        height: tech.height,
        weight: tech.weight,
        experience: tech.experience,
        services: JSON.stringify(tech.services),
        photos: JSON.stringify([
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
        ]),
        city: tech.city,
        district: tech.district,
        isVerified: true,
        isAvailable: true,
        rating: 4.5 + Math.random() * 0.5, // 4.5-5.0之间的评分
        orderCount: Math.floor(Math.random() * 200) + 50 // 50-250单
      }
    });
  }

  console.log('技师数据创建完成');

  // 创建测试客户
  const customerPassword = await bcrypt.hash('123456', 12);
  const customer = await prisma.user.upsert({
    where: { phone: '13900000001' },
    update: {},
    create: {
      phone: '13900000001',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      nickname: '测试用户',
      inviteCode: 'CUST001',
      isActive: true
    }
  });

  console.log('测试客户创建完成');

  console.log('数据初始化完成！');
  console.log('管理员账号: 13800000000 / admin123');
  console.log('技师账号: 13800000001-13800000004 / 123456');
  console.log('客户账号: 13900000001 / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
