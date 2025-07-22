import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  NavBar, 
  Card, 
  Button, 
  Grid, 
  Badge, 
  Avatar,
  List,
  Toast,
  Space,
  Divider
} from 'antd-mobile'
import {
  UserOutline,
  FileOutline,
  BillOutline,
  StarOutline,
  SetOutline,
  RightOutline,
  CheckCircleOutline,
  ClockCircleOutline,
  ExclamationCircleOutline
} from 'antd-mobile-icons'
import axios from 'axios'

const TechnicianDashboard = () => {
  const navigate = useNavigate()
  const [technicianInfo, setTechnicianInfo] = useState(null)
  const [stats, setStats] = useState({
    todayOrders: 0,
    monthIncome: 0,
    totalOrders: 0,
    rating: 0
  })
  const [loading, setLoading] = useState(true)

  // 检查登录状态和技师身份
  useEffect(() => {
    checkTechnicianAuth()
    loadTechnicianData()
  }, [])

  const checkTechnicianAuth = () => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('userRole')

    if (!token || userRole !== 'TECHNICIAN') {
      Toast.show({
        content: '请先登录技师账号',
        position: 'center'
      })
      navigate('/login')
    }
  }

  const loadTechnicianData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 获取技师资料
      const profileResponse = await axios.get('/api/technicians/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // 获取统计数据
      const statsResponse = await axios.get('/api/technicians/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setTechnicianInfo(profileResponse.data.profile)
      setStats(statsResponse.data.stats)
      
    } catch (error) {
      console.error('加载技师数据失败:', error)
      if (error.response?.status === 404) {
        // 技师资料不存在，引导创建
        Toast.show({
          content: '请先完善技师资料',
          position: 'center'
        })
        navigate('/technician/profile/create')
      } else {
        Toast.show({
          content: '加载数据失败，请重试',
          position: 'center'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    Toast.show({
      content: '已退出登录',
      position: 'center'
    })
    navigate('/login')
  }

  // 获取认证状态显示
  const getVerificationStatus = () => {
    if (!technicianInfo) return { text: '未知', color: '#999', icon: <ExclamationCircleOutline /> }
    
    if (technicianInfo.isVerified) {
      return { 
        text: '已认证', 
        color: '#00b578', 
        icon: <CheckCircleOutline /> 
      }
    } else {
      return { 
        text: '待审核', 
        color: '#ff8f1f', 
        icon: <ClockCircleOutline /> 
      }
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    )
  }

  const verificationStatus = getVerificationStatus()

  return (
    <div style={{ paddingBottom: '60px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 导航栏 */}
      <NavBar
        right={
          <Button 
            size="small" 
            color="primary" 
            fill="outline"
            onClick={handleLogout}
          >
            退出
          </Button>
        }
      >
        技师工作台
      </NavBar>

      {/* 技师信息卡片 */}
      <Card style={{ margin: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={technicianInfo?.photos?.[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face'}
            style={{ '--size': '60px', marginRight: '16px' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>
                {technicianInfo?.realName || '未设置姓名'}
              </h3>
              <div style={{ 
                marginLeft: '8px', 
                display: 'flex', 
                alignItems: 'center',
                color: verificationStatus.color,
                fontSize: '12px'
              }}>
                {verificationStatus.icon}
                <span style={{ marginLeft: '2px' }}>{verificationStatus.text}</span>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {technicianInfo?.city} {technicianInfo?.district}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
              ID: {technicianInfo?.id || '未分配'}
            </div>
          </div>
          <Button 
            size="small" 
            color="primary" 
            fill="outline"
            onClick={() => navigate('/technician/profile/edit')}
          >
            编辑资料
          </Button>
        </div>
      </Card>

      {/* 统计数据 */}
      <Card title="今日数据" style={{ margin: '0 16px 16px 16px' }}>
        <Grid columns={4} gap={16}>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea' }}>
                {stats.todayOrders}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                今日订单
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea' }}>
                ¥{stats.monthIncome}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                本月收入
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea' }}>
                {stats.totalOrders}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                总订单数
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#667eea' }}>
                {stats.rating}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                服务评分
              </div>
            </div>
          </Grid.Item>
        </Grid>
      </Card>

      {/* 功能菜单 */}
      <Card style={{ margin: '0 16px 16px 16px' }}>
        <List>
          <List.Item
            prefix={<BillOutline />}
            onClick={() => navigate('/technician/orders')}
            extra={<RightOutline />}
          >
            <div>
              <div>订单管理</div>
              <div style={{ fontSize: '12px', color: '#999' }}>查看和处理预约订单</div>
            </div>
          </List.Item>
          
          <List.Item
            prefix={<UserOutline />}
            onClick={() => navigate('/technician/profile/edit')}
            extra={<RightOutline />}
          >
            <div>
              <div>个人资料</div>
              <div style={{ fontSize: '12px', color: '#999' }}>编辑个人信息和照片</div>
            </div>
          </List.Item>
          
          <List.Item
            prefix={<FileOutline />}
            onClick={() => navigate('/technician/services')}
            extra={<RightOutline />}
          >
            <div>
              <div>服务管理</div>
              <div style={{ fontSize: '12px', color: '#999' }}>设置服务项目和价格</div>
            </div>
          </List.Item>
          
          <List.Item
            prefix={<StarOutline />}
            onClick={() => navigate('/technician/reviews')}
            extra={<RightOutline />}
          >
            <div>
              <div>评价管理</div>
              <div style={{ fontSize: '12px', color: '#999' }}>查看客户评价和反馈</div>
            </div>
          </List.Item>
          
          <List.Item
            prefix={<SetOutline />}
            onClick={() => navigate('/technician/settings')}
            extra={<RightOutline />}
          >
            <div>
              <div>设置</div>
              <div style={{ fontSize: '12px', color: '#999' }}>账号设置和隐私</div>
            </div>
          </List.Item>
        </List>
      </Card>

      {/* 快捷操作 */}
      <Card title="快捷操作" style={{ margin: '0 16px 16px 16px' }}>
        <Space direction="horizontal" style={{ width: '100%' }} justify="around">
          <Button 
            color="primary" 
            size="large"
            onClick={() => navigate('/technician/availability')}
          >
            设置可用时间
          </Button>
          <Button 
            color="success" 
            size="large"
            onClick={() => navigate('/technician/income')}
          >
            收入统计
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default TechnicianDashboard
