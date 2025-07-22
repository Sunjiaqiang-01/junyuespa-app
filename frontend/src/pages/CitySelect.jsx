import React, { useState, useEffect } from 'react'
import { NavBar, SearchBar, List, Toast, Grid, Tabs } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import { EnvironmentOutline, LeftOutline, RightOutline } from 'antd-mobile-icons'
import axios from 'axios'

const CitySelect = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [cities, setCities] = useState({
    hotCities: [],
    allCities: []
  })
  const [provinces, setProvinces] = useState([])
  const [selectedProvince, setSelectedProvince] = useState(null)
  const [provinceCities, setProvinceCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentCity, setCurrentCity] = useState(
    localStorage.getItem('selectedCity') || '北京'
  )
  const [viewMode, setViewMode] = useState('province') // 'province' | 'city' | 'search'
  const [isNavigating, setIsNavigating] = useState(false)

  // 加载城市数据
  useEffect(() => {
    loadCities()
  }, [])

  const loadCities = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/technicians/cities/list')
      setCities(response.data)

      // 按省份分组城市数据
      const provinceMap = new Map()
      response.data.allCities.forEach(city => {
        if (!provinceMap.has(city.province)) {
          provinceMap.set(city.province, [])
        }
        provinceMap.get(city.province).push(city)
      })

      // 转换为省份列表
      const provinceList = Array.from(provinceMap.keys()).map(provinceName => ({
        name: provinceName,
        cities: provinceMap.get(provinceName)
      })).sort((a, b) => a.name.localeCompare(b.name))

      setProvinces(provinceList)
    } catch (error) {
      console.error('加载城市数据失败:', error)
      Toast.show({
        content: '加载城市数据失败',
        position: 'center'
      })
    } finally {
      setLoading(false)
    }
  }

  // 搜索城市
  const filteredCities = searchText
    ? cities.allCities.filter(city =>
        city.name.includes(searchText) || city.province.includes(searchText)
      )
    : []

  // 处理省份选择
  const handleProvinceSelect = (province) => {
    setSelectedProvince(province)
    setProvinceCities(province.cities)
    setViewMode('city')
  }

  // 处理城市选择
  const handleCitySelect = (city) => {
    if (isNavigating) return // 防止重复点击

    setIsNavigating(true)
    setCurrentCity(city.name)
    localStorage.setItem('selectedCity', city.name)
    Toast.show({
      content: `已切换到${city.name}`,
      position: 'center'
    })

    // 短暂延迟后返回，让用户看到提示
    setTimeout(() => {
      navigate(-1)
    }, 500)
  }

  // 返回省份列表
  const handleBackToProvince = () => {
    if (isNavigating) return // 防止重复点击

    setSelectedProvince(null)
    setProvinceCities([])
    setViewMode('province')
    setIsNavigating(false) // 重置导航状态
  }

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value)
    setViewMode(value ? 'search' : 'province')
    setIsNavigating(false) // 重置导航状态
  }

  // 安全的返回函数
  const handleSafeBack = () => {
    if (isNavigating) return // 防止重复点击

    if (viewMode === 'city') {
      handleBackToProvince()
    } else {
      setIsNavigating(true)
      navigate(-1)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 导航栏 */}
      <NavBar
        back="返回"
        onBack={handleSafeBack}
        backIcon={<LeftOutline />}
      >
        {viewMode === 'city' ? `${selectedProvince?.name} - 选择城市` : '选择城市'}
      </NavBar>

      {/* 搜索栏 */}
      <div style={{ padding: '16px', background: '#fff' }}>
        <SearchBar
          placeholder="搜索省份或城市名称"
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      {/* 当前城市 */}
      <div style={{ padding: '16px', background: '#fff', borderBottom: '8px solid #f5f5f5' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>当前城市</h4>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          padding: '8px 0'
        }}>
          <EnvironmentOutline style={{ marginRight: '8px', color: '#667eea' }} />
          <span style={{ fontSize: '16px', fontWeight: '500' }}>{currentCity}</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {viewMode === 'search' ? (
          // 搜索结果
          <div style={{ height: '100%', overflow: 'auto', background: '#fff' }}>
            <List>
              {filteredCities.map(city => (
                <List.Item
                  key={city.id}
                  prefix={<EnvironmentOutline />}
                  onClick={() => handleCitySelect(city)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: currentCity === city.name ? '#f0f8ff' : 'transparent'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>{city.name}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {city.province}
                    </div>
                  </div>
                  {currentCity === city.name && (
                    <div style={{ color: '#667eea', fontSize: '12px' }}>当前</div>
                  )}
                </List.Item>
              ))}
            </List>

            {filteredCities.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999'
              }}>
                未找到相关城市
              </div>
            )}
          </div>
        ) : viewMode === 'city' ? (
          // 城市列表（选定省份下的城市）
          <div style={{ height: '100%', overflow: 'auto', background: '#fff' }}>
            <List>
              {provinceCities.map(city => (
                <List.Item
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: currentCity === city.name ? '#f0f8ff' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{city.name}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {currentCity === city.name && (
                        <span style={{ color: '#667eea', fontSize: '12px', marginRight: '8px' }}>当前</span>
                      )}
                    </div>
                  </div>
                </List.Item>
              ))}
            </List>
          </div>
        ) : (
          // 省份列表
          <div style={{ height: '100%', overflow: 'auto' }}>
            {/* 热门城市 */}
            {cities.hotCities && cities.hotCities.length > 0 && (
              <div style={{ padding: '16px', background: '#fff', marginBottom: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>热门城市</h4>
                <Grid columns={3} gap={8}>
                  {cities.hotCities.map(city => (
                    <Grid.Item key={city.id}>
                      <div
                        onClick={() => handleCitySelect(city)}
                        style={{
                          padding: '12px 8px',
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: currentCity === city.name ? '#667eea' : '#fff',
                          color: currentCity === city.name ? '#fff' : '#333',
                          fontSize: '14px',
                          fontWeight: currentCity === city.name ? '500' : 'normal',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {city.name}
                      </div>
                    </Grid.Item>
                  ))}
                </Grid>
              </div>
            )}

            {/* 省份列表 */}
            <div style={{ background: '#fff' }}>
              <div style={{ padding: '16px 16px 8px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <h4 style={{ margin: 0, color: '#333', fontSize: '16px' }}>选择省份</h4>
              </div>
              <List>
                {provinces.map((province, index) => (
                  <List.Item
                    key={index}
                    onClick={() => handleProvinceSelect(province)}
                    style={{ cursor: 'pointer' }}
                    extra={<RightOutline />}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{province.name}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {province.cities.length}个城市
                        </div>
                      </div>
                    </div>
                  </List.Item>
                ))}
              </List>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '6px'
        }}>
          加载中...
        </div>
      )}
    </div>
  )
}

export default CitySelect
