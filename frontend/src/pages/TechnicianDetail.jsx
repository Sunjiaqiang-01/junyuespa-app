import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  NavBar,
  Card,
  Button,
  Tag,
  Toast,
  Swiper,
  Space,
  Divider,
  Grid
} from 'antd-mobile'
import {
  LeftOutline,
  StarFill,
  EnvironmentOutline,
  PhoneFill,
  ClockCircleOutline,
  UserOutline
} from 'antd-mobile-icons'
import axios from 'axios'
import { enableAntiCopyProtection, disableAntiCopyProtection } from '../utils/antiCopy'

const TechnicianDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [technician, setTechnician] = useState(null)
  const [loading, setLoading] = useState(true)

  // 加载技师详情
  useEffect(() => {
    loadTechnicianDetail()

    // 启用防复制保护
    enableAntiCopyProtection({
      disableRightClick: true,
      disableSelection: true,
      disableShortcuts: true,
      disableLongPress: true,
      protectImages: true,
      detectScreenshot: true
    })

    // 组件卸载时清理
    return () => {
      disableAntiCopyProtection()
    }
  }, [id])

  const loadTechnicianDetail = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/technicians/${id}`)
      setTechnician(response.data.technician)
    } catch (error) {
      console.error('加载技师详情失败:', error)
      Toast.show({
        content: '加载失败，请重试',
        position: 'center'
      })
    } finally {
      setLoading(false)
    }
  }

  // 立即预约
  const handleBooking = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      Toast.show({
        content: '请先登录',
        position: 'center'
      })
      navigate('/login')
      return
    }
    navigate(`/booking/${id}`)
  }

  // 联系技师（模拟功能）
  const handleContact = () => {
    Toast.show({
      content: '联系功能开发中...',
      position: 'center'
    })
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

  if (!technician) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px 20px' 
      }}>
        <p>技师信息不存在</p>
        <Button 
          color="primary" 
          onClick={() => navigate('/technicians')}
          style={{ marginTop: '16px' }}
        >
          返回技师列表
        </Button>
      </div>
    )
  }

  return (
    <div className="no-select" style={{ paddingBottom: '80px' }}>
      {/* 导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        backIcon={<LeftOutline />}
      >
        技师详情
      </NavBar>

      {/* 技师照片轮播 */}
      <div style={{ background: '#000' }}>
        <Swiper autoplay loop>
          {technician.photos?.map((photo, index) => (
            <Swiper.Item key={index}>
              <img
                src={photo}
                alt={`${technician.name}照片${index + 1}`}
                style={{
                  width: '100%',
                  height: '300px',
                  objectFit: 'cover'
                }}
                className="no-context-menu"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
              />
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* 基本信息 */}
      <Card style={{ margin: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: '0 0 8px 0' 
            }}>
              {technician.name}
            </h2>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '12px',
              fontSize: '14px',
              color: '#666'
            }}>
              <span>{technician.age}岁</span>
              <span>{technician.height}</span>
              {technician.weight && <span>{technician.weight}</span>}
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <EnvironmentOutline style={{ fontSize: '12px', marginRight: '2px' }} />
                {technician.city} {technician.district}
              </span>
            </div>

            {/* 服务标签 */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '6px',
              marginBottom: '12px'
            }}>
              {technician.services?.map((service, index) => (
                <Tag 
                  key={index} 
                  color="primary" 
                  fill="outline"
                  style={{ fontSize: '12px' }}
                >
                  {service}
                </Tag>
              ))}
            </div>
          </div>

          {/* 评分和订单数 */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#ff6b35',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              <StarFill style={{ fontSize: '16px', marginRight: '4px' }} />
              {technician.rating}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {technician.orderCount}单好评
            </div>
          </div>
        </div>
      </Card>

      {/* 服务统计 */}
      <Card title="服务统计" style={{ margin: '8px 0 0 0' }}>
        <Grid columns={3} gap={16}>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea' }}>
                {technician.orderCount}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                服务次数
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea' }}>
                {technician.rating}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                服务评分
              </div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#667eea' }}>
                {technician.isAvailable ? '在线' : '离线'}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                当前状态
              </div>
            </div>
          </Grid.Item>
        </Grid>
      </Card>

      {/* 个人介绍 */}
      {technician.experience && (
        <Card title="个人介绍" style={{ margin: '8px 0 0 0' }}>
          <p style={{ 
            lineHeight: '1.6', 
            color: '#333',
            fontSize: '14px'
          }}>
            {technician.experience}
          </p>
        </Card>
      )}

      {/* 服务项目 */}
      <Card title="服务项目" style={{ margin: '8px 0 0 0' }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '8px'
        }}>
          {technician.services?.map((service, index) => (
            <div
              key={index}
              style={{
                padding: '8px 16px',
                background: '#f0f8ff',
                border: '1px solid #667eea',
                borderRadius: '20px',
                fontSize: '14px',
                color: '#667eea'
              }}
            >
              {service}
            </div>
          ))}
        </div>
      </Card>

      {/* 底部操作栏 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '414px',
        background: '#fff',
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        gap: '12px'
      }}>
        <Button
          color="default"
          size="large"
          style={{ flex: '0 0 auto', minWidth: '80px' }}
          onClick={handleContact}
        >
          <PhoneFill style={{ marginRight: '4px' }} />
          联系
        </Button>
        <Button
          color="primary"
          size="large"
          style={{ flex: 1 }}
          onClick={handleBooking}
          disabled={!technician.isAvailable}
        >
          <ClockCircleOutline style={{ marginRight: '4px' }} />
          {technician.isAvailable ? '立即预约' : '暂不可约'}
        </Button>
      </div>
    </div>
  )
}

export default TechnicianDetail
