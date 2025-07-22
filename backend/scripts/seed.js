import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 开始创建测试数据...')

  // 清空现有数据
  await prisma.order.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.technicianProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.city.deleteMany()

  console.log('🗑️ 已清空现有数据')

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 10)

  // 创建客户账户
  const customer = await prisma.user.create({
    data: {
      phone: '13800138001',
      passwordHash: hashedPassword,
      nickname: '测试客户',
      role: 'CUSTOMER',
      inviteCode: 'CUST001'
    }
  })

  // 创建技师账户
  const technician = await prisma.user.create({
    data: {
      phone: '13800138002',
      passwordHash: hashedPassword,
      nickname: '测试技师',
      role: 'TECHNICIAN',
      inviteCode: 'TECH001'
    }
  })

  // 创建技师资料
  const technicianProfile = await prisma.technicianProfile.create({
    data: {
      userId: technician.id,
      realName: '张美丽',
      gender: '女',
      age: 25,
      height: '165cm',
      weight: '50kg',
      experience: '专业按摩师，有3年工作经验，擅长各种按摩手法。',
      services: JSON.stringify(['项目一，498 60分钟', '项目二，598 80分钟']),
      photos: JSON.stringify([]),
      city: '北京市',
      district: '朝阳区',
      isVerified: true,
      isAvailable: true,
      rating: 4.8,
      orderCount: 15
    }
  })

  // 创建管理员账户
  const admin = await prisma.user.create({
    data: {
      phone: '13800138000',
      passwordHash: hashedPassword,
      nickname: '系统管理员',
      role: 'ADMIN',
      inviteCode: 'ADMIN001'
    }
  })

  // 创建城市数据
  await prisma.city.createMany({
    data: [
      // 直辖市
      { name: '北京市', province: '北京市' },
      { name: '上海市', province: '上海市' },
      { name: '天津市', province: '天津市' },
      { name: '重庆市', province: '重庆市' },

      // 广东省
      { name: '广州市', province: '广东省' },
      { name: '深圳市', province: '广东省' },
      { name: '珠海市', province: '广东省' },
      { name: '汕头市', province: '广东省' },
      { name: '佛山市', province: '广东省' },
      { name: '韶关市', province: '广东省' },
      { name: '湛江市', province: '广东省' },
      { name: '肇庆市', province: '广东省' },
      { name: '江门市', province: '广东省' },
      { name: '茂名市', province: '广东省' },
      { name: '惠州市', province: '广东省' },
      { name: '梅州市', province: '广东省' },
      { name: '汕尾市', province: '广东省' },
      { name: '河源市', province: '广东省' },
      { name: '阳江市', province: '广东省' },
      { name: '清远市', province: '广东省' },
      { name: '东莞市', province: '广东省' },
      { name: '中山市', province: '广东省' },
      { name: '潮州市', province: '广东省' },
      { name: '揭阳市', province: '广东省' },
      { name: '云浮市', province: '广东省' },

      // 江苏省
      { name: '南京市', province: '江苏省' },
      { name: '无锡市', province: '江苏省' },
      { name: '徐州市', province: '江苏省' },
      { name: '常州市', province: '江苏省' },
      { name: '苏州市', province: '江苏省' },
      { name: '南通市', province: '江苏省' },
      { name: '连云港市', province: '江苏省' },
      { name: '淮安市', province: '江苏省' },
      { name: '盐城市', province: '江苏省' },
      { name: '扬州市', province: '江苏省' },
      { name: '镇江市', province: '江苏省' },
      { name: '泰州市', province: '江苏省' },
      { name: '宿迁市', province: '江苏省' },

      // 浙江省
      { name: '杭州市', province: '浙江省' },
      { name: '宁波市', province: '浙江省' },
      { name: '温州市', province: '浙江省' },
      { name: '嘉兴市', province: '浙江省' },
      { name: '湖州市', province: '浙江省' },
      { name: '绍兴市', province: '浙江省' },
      { name: '金华市', province: '浙江省' },
      { name: '衢州市', province: '浙江省' },
      { name: '舟山市', province: '浙江省' },
      { name: '台州市', province: '浙江省' },
      { name: '丽水市', province: '浙江省' },

      // 山东省
      { name: '济南市', province: '山东省' },
      { name: '青岛市', province: '山东省' },
      { name: '淄博市', province: '山东省' },
      { name: '枣庄市', province: '山东省' },
      { name: '东营市', province: '山东省' },
      { name: '烟台市', province: '山东省' },
      { name: '潍坊市', province: '山东省' },
      { name: '济宁市', province: '山东省' },
      { name: '泰安市', province: '山东省' },
      { name: '威海市', province: '山东省' },
      { name: '日照市', province: '山东省' },
      { name: '临沂市', province: '山东省' },
      { name: '德州市', province: '山东省' },
      { name: '聊城市', province: '山东省' },
      { name: '滨州市', province: '山东省' },
      { name: '菏泽市', province: '山东省' },

      // 河北省
      { name: '石家庄市', province: '河北省' },
      { name: '唐山市', province: '河北省' },
      { name: '秦皇岛市', province: '河北省' },
      { name: '邯郸市', province: '河北省' },
      { name: '邢台市', province: '河北省' },
      { name: '保定市', province: '河北省' },
      { name: '张家口市', province: '河北省' },
      { name: '承德市', province: '河北省' },
      { name: '沧州市', province: '河北省' },
      { name: '廊坊市', province: '河北省' },
      { name: '衡水市', province: '河北省' },

      // 河南省
      { name: '郑州市', province: '河南省' },
      { name: '开封市', province: '河南省' },
      { name: '洛阳市', province: '河南省' },
      { name: '平顶山市', province: '河南省' },
      { name: '安阳市', province: '河南省' },
      { name: '鹤壁市', province: '河南省' },
      { name: '新乡市', province: '河南省' },
      { name: '焦作市', province: '河南省' },
      { name: '濮阳市', province: '河南省' },
      { name: '许昌市', province: '河南省' },
      { name: '漯河市', province: '河南省' },
      { name: '三门峡市', province: '河南省' },
      { name: '南阳市', province: '河南省' },
      { name: '商丘市', province: '河南省' },
      { name: '信阳市', province: '河南省' },
      { name: '周口市', province: '河南省' },
      { name: '驻马店市', province: '河南省' },

      // 湖北省
      { name: '武汉市', province: '湖北省' },
      { name: '黄石市', province: '湖北省' },
      { name: '十堰市', province: '湖北省' },
      { name: '宜昌市', province: '湖北省' },
      { name: '襄阳市', province: '湖北省' },
      { name: '鄂州市', province: '湖北省' },
      { name: '荆门市', province: '湖北省' },
      { name: '孝感市', province: '湖北省' },
      { name: '荆州市', province: '湖北省' },
      { name: '黄冈市', province: '湖北省' },
      { name: '咸宁市', province: '湖北省' },
      { name: '随州市', province: '湖北省' },

      // 湖南省
      { name: '长沙市', province: '湖南省' },
      { name: '株洲市', province: '湖南省' },
      { name: '湘潭市', province: '湖南省' },
      { name: '衡阳市', province: '湖南省' },
      { name: '邵阳市', province: '湖南省' },
      { name: '岳阳市', province: '湖南省' },
      { name: '常德市', province: '湖南省' },
      { name: '张家界市', province: '湖南省' },
      { name: '益阳市', province: '湖南省' },
      { name: '郴州市', province: '湖南省' },
      { name: '永州市', province: '湖南省' },
      { name: '怀化市', province: '湖南省' },
      { name: '娄底市', province: '湖南省' },

      // 安徽省
      { name: '合肥市', province: '安徽省' },
      { name: '芜湖市', province: '安徽省' },
      { name: '蚌埠市', province: '安徽省' },
      { name: '淮南市', province: '安徽省' },
      { name: '马鞍山市', province: '安徽省' },
      { name: '淮北市', province: '安徽省' },
      { name: '铜陵市', province: '安徽省' },
      { name: '安庆市', province: '安徽省' },
      { name: '黄山市', province: '安徽省' },
      { name: '滁州市', province: '安徽省' },
      { name: '阜阳市', province: '安徽省' },
      { name: '宿州市', province: '安徽省' },
      { name: '六安市', province: '安徽省' },
      { name: '亳州市', province: '安徽省' },
      { name: '池州市', province: '安徽省' },
      { name: '宣城市', province: '安徽省' },

      // 福建省
      { name: '福州市', province: '福建省' },
      { name: '厦门市', province: '福建省' },
      { name: '莆田市', province: '福建省' },
      { name: '三明市', province: '福建省' },
      { name: '泉州市', province: '福建省' },
      { name: '漳州市', province: '福建省' },
      { name: '南平市', province: '福建省' },
      { name: '龙岩市', province: '福建省' },
      { name: '宁德市', province: '福建省' },

      // 江西省
      { name: '南昌市', province: '江西省' },
      { name: '景德镇市', province: '江西省' },
      { name: '萍乡市', province: '江西省' },
      { name: '九江市', province: '江西省' },
      { name: '新余市', province: '江西省' },
      { name: '鹰潭市', province: '江西省' },
      { name: '赣州市', province: '江西省' },
      { name: '吉安市', province: '江西省' },
      { name: '宜春市', province: '江西省' },
      { name: '抚州市', province: '江西省' },
      { name: '上饶市', province: '江西省' },

      // 四川省
      { name: '成都市', province: '四川省' },
      { name: '自贡市', province: '四川省' },
      { name: '攀枝花市', province: '四川省' },
      { name: '泸州市', province: '四川省' },
      { name: '德阳市', province: '四川省' },
      { name: '绵阳市', province: '四川省' },
      { name: '广元市', province: '四川省' },
      { name: '遂宁市', province: '四川省' },
      { name: '内江市', province: '四川省' },
      { name: '乐山市', province: '四川省' },
      { name: '南充市', province: '四川省' },
      { name: '眉山市', province: '四川省' },
      { name: '宜宾市', province: '四川省' },
      { name: '广安市', province: '四川省' },
      { name: '达州市', province: '四川省' },
      { name: '雅安市', province: '四川省' },
      { name: '巴中市', province: '四川省' },
      { name: '资阳市', province: '四川省' },

      // 陕西省
      { name: '西安市', province: '陕西省' },
      { name: '铜川市', province: '陕西省' },
      { name: '宝鸡市', province: '陕西省' },
      { name: '咸阳市', province: '陕西省' },
      { name: '渭南市', province: '陕西省' },
      { name: '延安市', province: '陕西省' },
      { name: '汉中市', province: '陕西省' },
      { name: '榆林市', province: '陕西省' },
      { name: '安康市', province: '陕西省' },
      { name: '商洛市', province: '陕西省' },

      // 辽宁省
      { name: '沈阳市', province: '辽宁省' },
      { name: '大连市', province: '辽宁省' },
      { name: '鞍山市', province: '辽宁省' },
      { name: '抚顺市', province: '辽宁省' },
      { name: '本溪市', province: '辽宁省' },
      { name: '丹东市', province: '辽宁省' },
      { name: '锦州市', province: '辽宁省' },
      { name: '营口市', province: '辽宁省' },
      { name: '阜新市', province: '辽宁省' },
      { name: '辽阳市', province: '辽宁省' },
      { name: '盘锦市', province: '辽宁省' },
      { name: '铁岭市', province: '辽宁省' },
      { name: '朝阳市', province: '辽宁省' },
      { name: '葫芦岛市', province: '辽宁省' },

      // 吉林省
      { name: '长春市', province: '吉林省' },
      { name: '吉林市', province: '吉林省' },
      { name: '四平市', province: '吉林省' },
      { name: '辽源市', province: '吉林省' },
      { name: '通化市', province: '吉林省' },
      { name: '白山市', province: '吉林省' },
      { name: '松原市', province: '吉林省' },
      { name: '白城市', province: '吉林省' },

      // 黑龙江省
      { name: '哈尔滨市', province: '黑龙江省' },
      { name: '齐齐哈尔市', province: '黑龙江省' },
      { name: '鸡西市', province: '黑龙江省' },
      { name: '鹤岗市', province: '黑龙江省' },
      { name: '双鸭山市', province: '黑龙江省' },
      { name: '大庆市', province: '黑龙江省' },
      { name: '伊春市', province: '黑龙江省' },
      { name: '佳木斯市', province: '黑龙江省' },
      { name: '七台河市', province: '黑龙江省' },
      { name: '牡丹江市', province: '黑龙江省' },
      { name: '黑河市', province: '黑龙江省' },
      { name: '绥化市', province: '黑龙江省' }
    ]
  })

  console.log('✅ 测试数据创建完成!')
  console.log('📱 测试账户信息:')
  console.log('客户账户: 13800138001 / 123456')
  console.log('技师账户: 13800138002 / 123456')
  console.log('管理员账户: 13800138000 / 123456')
}

main()
  .catch((e) => {
    console.error('❌ 创建测试数据失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
