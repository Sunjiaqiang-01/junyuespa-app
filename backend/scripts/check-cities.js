import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCities() {
  try {
    const cities = await prisma.city.findMany({
      orderBy: [{ province: 'asc' }, { name: 'asc' }]
    })

    console.log(`📊 总共有 ${cities.length} 个城市`)
    
    // 按省份统计
    const provinceStats = cities.reduce((acc, city) => {
      if (!acc[city.province]) {
        acc[city.province] = 0
      }
      acc[city.province]++
      return acc
    }, {})

    console.log('\n📍 各省份城市数量:')
    Object.entries(provinceStats).forEach(([province, count]) => {
      console.log(`${province}: ${count}个城市`)
    })

    console.log('\n🏙️ 前20个城市:')
    cities.slice(0, 20).forEach(city => {
      console.log(`${city.name} (${city.province})`)
    })

  } catch (error) {
    console.error('检查城市数据失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCities()
