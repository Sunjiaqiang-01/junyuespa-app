import React from 'react'
import { Button, Grid, Card, Space } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { 
  UserOutline, 
  TeamOutline, 
  CalendarOutline,
  LocationOutline 
} from 'antd-mobile-icons'

const Home = () => {
  const navigate = useNavigate()
  const currentCity = localStorage.getItem('selectedCity') || '北京'

  const menuItems = [
    {
      icon: <TeamOutline />,
      title: '找技师',
      desc: '浏览专业技师',
      path: '/technicians',
      color: '#667eea'
    },
    {
      icon: <CalendarOutline />,
      title: '我的预约',
      desc: '查看预约记录',
      path: '/orders',
      color: '#f093fb'
    },
    {
      icon: <UserOutline />,
      title: '个人中心',
      desc: '账户与设置',
      path: '/profile',
      color: '#4facfe'
    },
    {
      icon: <LocationOutline />,
      title: '选择城市',
      desc: '切换服务城市',
      path: '/city',
      color: '#43e97b'
    }
  ]

  return (
    <div className="page-container">
      {/* 头部横幅 */}
      <Card className="mb-3">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img
            src="/logo.png"
            alt="君悦彩虹SPA"
            style={{
              width: '120px',
              height: 'auto',
              marginBottom: '12px',
              borderRadius: '8px'
            }}
          />
          <h1 style={{
            fontSize: '28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            君悦彩虹SPA
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            专业技师 · 贴心服务 · 安全可靠
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '8px',
            color: '#999',
            fontSize: '14px'
          }}>
            <LocationOutline style={{ marginRight: '4px' }} />
            当前城市：{currentCity}
          </div>
        </div>
      </Card>

      {/* 功能菜单 */}
      <Grid columns={2} gap={16}>
        {menuItems.map((item, index) => (
          <Grid.Item key={index}>
            <Card 
              onClick={() => navigate(item.path)}
              style={{ 
                textAlign: 'center', 
                padding: '24px 16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ 
                fontSize: '32px', 
                color: item.color,
                marginBottom: '12px'
              }}>
                {item.icon}
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {item.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#999'
              }}>
                {item.desc}
              </div>
            </Card>
          </Grid.Item>
        ))}
      </Grid>

      {/* 快速操作 */}
      <Card className="mt-3">
        <h3 style={{ marginBottom: '16px' }}>快速操作</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            color="primary" 
            size="large" 
            block
            onClick={() => navigate('/technicians')}
          >
            立即预约技师
          </Button>
          <Button 
            color="default" 
            size="large" 
            block
            onClick={() => navigate('/login')}
          >
            登录/注册
          </Button>
        </Space>
      </Card>

      {/* 底部信息 */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px 0',
        color: '#999',
        fontSize: '12px'
      }}>
        <p>服务时间：24小时</p>
        <p>客服热线：400-888-8888</p>
        <p style={{ marginTop: '8px' }}>
          君悦彩虹SPA © 2025
        </p>
      </div>
    </div>
  )
}

export default Home
