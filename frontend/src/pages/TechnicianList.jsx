import React, { useState, useEffect } from 'react'
import { Card, Button, Tag, SearchBar, Selector, InfiniteScroll, Toast } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { StarFill, EnvironmentOutline } from 'antd-mobile-icons'
import axios from 'axios'

const TechnicianList = () => {
  const navigate = useNavigate()
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedCity, setSelectedCity] = useState(
    localStorage.getItem('selectedCity') || '北京'
  )
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [cities, setCities] = useState({ hotCities: [] })

  // 加载技师数据
  const loadTechnicians = async (isRefresh = false) => {
    if (loading) return
    
    setLoading(true)
    try {
      const currentPage = isRefresh ? 1 : page
      const params = {
        page: currentPage,
        limit: 10,
        city: selectedCity,
        search: searchText
      }

      const response = await axios.get('/api/technicians', { params })
      const newTechnicians = response.data.technicians || []
      
      if (isRefresh) {
        setTechnicians(newTechnicians)
        setPage(2)
      } else {
        setTechnicians(prev => [...prev, ...newTechnicians])
        setPage(prev => prev + 1)
      }
      
      setHasMore(newTechnicians.length === 10)
    } catch (error) {
      console.error('加载技师数据失败:', error)
      Toast.show({
        content: '加载失败，请重试',
        position: 'center'
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载城市数据
  useEffect(() => {
    loadCities()
  }, [])

  // 初始加载和筛选条件变化时重新加载
  useEffect(() => {
    loadTechnicians(true)
  }, [selectedCity, searchText])

  const loadCities = async () => {
    try {
      const response = await axios.get('/api/technicians/cities/list')
      setCities(response.data)
    } catch (error) {
      console.error('加载城市数据失败:', error)
    }
  }

  // 技师卡片组件
  const TechnicianCard = ({ technician }) => (
    <Card 
      className="technician-card no-select"
      onClick={() => navigate(`/technician/${technician.id}`)}
      style={{ marginBottom: '12px', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* 头像 */}
        <div style={{ position: 'relative', marginRight: '12px' }}>
          <img 
            src={technician.photos?.[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'} 
            alt={technician.name}
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '8px',
              objectFit: 'cover'
            }}
            className="no-context-menu"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
          {/* 在线状态 */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: technician.isAvailable ? '#52c41a' : '#d9d9d9',
            border: '2px solid white'
          }} />
        </div>

        {/* 技师信息 */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px'
          }}>
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                margin: '0 0 4px 0'
              }}>
                {technician.name}
              </h3>
              <div style={{ 
                fontSize: '12px', 
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>{technician.age}岁</span>
                <span>{technician.height}</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <EnvironmentOutline style={{ fontSize: '12px', marginRight: '2px' }} />
                  {technician.district || technician.city}
                </span>
              </div>
            </div>
            
            {/* 评分 */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                color: '#ff6b35',
                fontSize: '14px',
                marginBottom: '2px'
              }}>
                <StarFill style={{ fontSize: '12px', marginRight: '2px' }} />
                {technician.rating}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {technician.orderCount}单
              </div>
            </div>
          </div>

          {/* 服务标签 */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '4px',
            marginBottom: '8px'
          }}>
            {technician.services?.slice(0, 3).map((service, index) => (
              <Tag 
                key={index} 
                color="primary" 
                fill="outline"
                style={{ fontSize: '11px' }}
              >
                {service}
              </Tag>
            ))}
          </div>

          {/* 状态和预约按钮 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              fontSize: '12px',
              color: technician.isAvailable ? '#52c41a' : '#999'
            }}>
              {technician.isAvailable ? '在线' : '离线'}
            </span>
            <Button 
              color="primary" 
              size="mini"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/booking/${technician.id}`)
              }}
            >
              立即预约
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="page-container">
      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '16px' }}>
        <SearchBar
          placeholder="搜索技师姓名或服务项目"
          value={searchText}
          onChange={setSearchText}
          style={{ marginBottom: '12px' }}
        />
        
        <div style={{ marginBottom: '8px', fontSize: '14px', color: '#666' }}>
          当前城市：
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/city')}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EnvironmentOutline style={{ marginRight: '8px', color: '#667eea' }} />
            <span>{selectedCity}</span>
          </div>
          <span style={{ color: '#999', fontSize: '12px' }}>切换</span>
        </div>
      </Card>

      {/* 技师列表 */}
      <div>
        {technicians.map(technician => (
          <TechnicianCard key={technician.id} technician={technician} />
        ))}
        
        <InfiniteScroll loadMore={() => loadTechnicians(false)} hasMore={hasMore}>
          {hasMore ? '加载中...' : '没有更多了'}
        </InfiniteScroll>
      </div>

      {/* 返回首页 */}
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <Button 
          fill="none" 
          color="primary"
          onClick={() => navigate('/')}
        >
          返回首页
        </Button>
      </div>
    </div>
  )
}

export default TechnicianList
