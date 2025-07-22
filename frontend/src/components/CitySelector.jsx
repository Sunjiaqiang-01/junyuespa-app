import React, { useState, useEffect } from 'react'
import { Popup, SearchBar, List, IndexBar, Toast } from 'antd-mobile'
import { EnvironmentOutline } from 'antd-mobile-icons'
import axios from 'axios'

const CitySelector = ({ visible, onClose, onSelect, currentCity }) => {
  const [searchText, setSearchText] = useState('')
  const [cities, setCities] = useState({
    hotCities: [],
    citiesByProvince: {},
    allCities: []
  })
  const [loading, setLoading] = useState(false)

  // 加载城市数据
  useEffect(() => {
    if (visible) {
      loadCities()
    }
  }, [visible])

  const loadCities = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/technicians/cities/list')
      setCities(response.data)
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

  // 处理城市选择
  const handleCitySelect = (city) => {
    onSelect(city)
    onClose()
    Toast.show({
      content: `已切换到${city.name}`,
      position: 'center'
    })
  }

  // 准备IndexBar数据
  const indexBarData = Object.keys(cities.citiesByProvince).map(province => ({
    title: province,
    items: cities.citiesByProvince[province]
  }))

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{ height: '80vh' }}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 头部 */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          background: '#fff'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <h3 style={{ margin: 0 }}>选择城市</h3>
            <span 
              onClick={onClose}
              style={{ 
                fontSize: '16px', 
                color: '#999', 
                cursor: 'pointer' 
              }}
            >
              ✕
            </span>
          </div>
          
          <SearchBar
            placeholder="搜索城市名称"
            value={searchText}
            onChange={setSearchText}
          />
        </div>

        {/* 内容区域 */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {searchText ? (
            // 搜索结果
            <div style={{ height: '100%', overflow: 'auto' }}>
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
          ) : (
            // 城市列表
            <div style={{ height: '100%' }}>
              {/* 热门城市 */}
              {cities.hotCities.length > 0 && (
                <div style={{ padding: '16px', background: '#fff' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>热门城市</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px' 
                  }}>
                    {cities.hotCities.map(city => (
                      <div
                        key={city.id}
                        onClick={() => handleCitySelect(city)}
                        style={{
                          padding: '8px 12px',
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: currentCity === city.name ? '#667eea' : '#fff',
                          color: currentCity === city.name ? '#fff' : '#333',
                          fontSize: '14px'
                        }}
                      >
                        {city.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 全部城市 */}
              <div style={{ flex: 1, background: '#f5f5f5' }}>
                <IndexBar>
                  {indexBarData.map(province => (
                    <IndexBar.Panel
                      key={province.title}
                      index={province.title}
                      title={province.title}
                    >
                      <List>
                        {province.items.map(city => (
                          <List.Item
                            key={city.id}
                            onClick={() => handleCitySelect(city)}
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: currentCity === city.name ? '#f0f8ff' : 'transparent'
                            }}
                          >
                            {city.name}
                          </List.Item>
                        ))}
                      </List>
                    </IndexBar.Panel>
                  ))}
                </IndexBar>
              </div>
            </div>
          )}
        </div>
      </div>
    </Popup>
  )
}

export default CitySelector
