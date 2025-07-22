import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('检查用户数据...');
    const users = await prisma.user.findMany({
      where: { role: 'TECHNICIAN' }
    });
    console.log('技师用户数量:', users.length);
    users.forEach(user => {
      console.log(`用户ID: ${user.id}, 手机: ${user.phone}, 昵称: ${user.nickname}`);
    });
    
    console.log('\n检查技师资料...');
    const profiles = await prisma.technicianProfile.findMany();
    console.log('技师资料数量:', profiles.length);
    profiles.forEach(profile => {
      console.log(`资料ID: ${profile.id}, 用户ID: ${profile.userId}, 姓名: ${profile.realName}`);
    });
    
    console.log('\n检查用户ID为2的技师资料...');
    const profile = await prisma.technicianProfile.findUnique({
      where: { userId: 2 },
      include: { user: true }
    });
    console.log('用户ID为2的技师资料:', JSON.stringify(profile, null, 2));
    
  } catch (error) {
    console.error('数据库查询错误:', error);
    console.error('错误堆栈:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
