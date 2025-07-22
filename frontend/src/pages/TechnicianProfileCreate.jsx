import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  NavBar,
  Card,
  Button,
  Form,
  Input,
  Selector,
  Toast,
  ImageUploader,
  TextArea,
  Space,
  Divider,
  Popup,
  PickerView
} from 'antd-mobile'
import { 
  LeftOutline,
  UserOutline,
  CameraOutline
} from 'antd-mobile-icons'
import axios from 'axios'
import { compressImage } from '../utils/imageCompress'

const TechnicianProfileCreate = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [availableCities, setAvailableCities] = useState([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showProvinceSelector, setShowProvinceSelector] = useState(false)
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [photos, setPhotos] = useState([])

  // 省份数据
  const provinces = [
    { label: '北京市', value: '北京市' },
    { label: '天津市', value: '天津市' },
    { label: '上海市', value: '上海市' },
    { label: '重庆市', value: '重庆市' },
    { label: '河北省', value: '河北省' },
    { label: '山西省', value: '山西省' },
    { label: '辽宁省', value: '辽宁省' },
    { label: '吉林省', value: '吉林省' },
    { label: '黑龙江省', value: '黑龙江省' },
    { label: '江苏省', value: '江苏省' },
    { label: '浙江省', value: '浙江省' },
    { label: '安徽省', value: '安徽省' },
    { label: '福建省', value: '福建省' },
    { label: '江西省', value: '江西省' },
    { label: '山东省', value: '山东省' },
    { label: '河南省', value: '河南省' },
    { label: '湖北省', value: '湖北省' },
    { label: '湖南省', value: '湖南省' },
    { label: '广东省', value: '广东省' },
    { label: '海南省', value: '海南省' },
    { label: '四川省', value: '四川省' },
    { label: '贵州省', value: '贵州省' },
    { label: '云南省', value: '云南省' },
    { label: '陕西省', value: '陕西省' },
    { label: '甘肃省', value: '甘肃省' },
    { label: '青海省', value: '青海省' },
    { label: '台湾省', value: '台湾省' },
    { label: '内蒙古自治区', value: '内蒙古自治区' },
    { label: '广西壮族自治区', value: '广西壮族自治区' },
    { label: '西藏自治区', value: '西藏自治区' },
    { label: '宁夏回族自治区', value: '宁夏回族自治区' },
    { label: '新疆维吾尔自治区', value: '新疆维吾尔自治区' },
    { label: '香港特别行政区', value: '香港特别行政区' },
    { label: '澳门特别行政区', value: '澳门特别行政区' }
  ]

  useEffect(() => {
    checkAuth()
    loadCities()
  }, [])

  // 处理省份选择
  const handleProvinceChange = (value) => {
    const province = value[0]
    setSelectedProvince(province)
    setSelectedCity('')
    setAvailableCities([])
    setShowProvinceSelector(false)

    // 根据省份加载对应城市
    const provinceCities = cities.filter(city => city.province === province)
    setAvailableCities(provinceCities)

    // 更新表单
    form.setFieldsValue({ province: province, city: '' })
  }

  // 处理城市选择
  const handleCityChange = (value) => {
    const city = value[0]
    setSelectedCity(city)
    setShowCitySelector(false)

    // 更新表单
    form.setFieldsValue({ city: city })
  }

  // 处理位置选择（预留高德API接口）
  const handleSelectLocation = () => {
    // TODO: 接入高德地图API选择位置
    Toast.show({
      content: '位置选择功能开发中，将接入高德地图API',
      position: 'center'
    })
  }

  const checkAuth = () => {
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

  const loadCities = async () => {
    try {
      const response = await axios.get('/api/technicians/cities/list')
      const cityData = response.data.allCities.map(city => ({
        label: city.name,
        value: city.name,
        province: city.province
      }))
      setCities(cityData)
    } catch (error) {
      console.error('加载城市数据失败:', error)
      // 如果API失败，使用本地数据作为备用
      const mockCities = [
        { label: '北京', value: '北京', province: '北京市' },
        { label: '天津', value: '天津', province: '天津市' },
        { label: '上海', value: '上海', province: '上海市' },
        { label: '重庆', value: '重庆', province: '重庆市' },
        { label: '广州', value: '广州', province: '广东省' },
        { label: '深圳', value: '深圳', province: '广东省' },
        { label: '东莞', value: '东莞', province: '广东省' },
        { label: '佛山', value: '佛山', province: '广东省' },
        { label: '南京', value: '南京', province: '江苏省' },
        { label: '苏州', value: '苏州', province: '江苏省' },
        { label: '无锡', value: '无锡', province: '江苏省' },
        { label: '常州', value: '常州', province: '江苏省' },
        { label: '杭州', value: '杭州', province: '浙江省' },
        { label: '宁波', value: '宁波', province: '浙江省' },
        { label: '温州', value: '温州', province: '浙江省' },
        { label: '济南', value: '济南', province: '山东省' },
        { label: '青岛', value: '青岛', province: '山东省' },
        { label: '烟台', value: '烟台', province: '山东省' },
        { label: '郑州', value: '郑州', province: '河南省' },
        { label: '洛阳', value: '洛阳', province: '河南省' },
        { label: '武汉', value: '武汉', province: '湖北省' },
        { label: '宜昌', value: '宜昌', province: '湖北省' },
        { label: '长沙', value: '长沙', province: '湖南省' },
        { label: '株洲', value: '株洲', province: '湖南省' },
        { label: '成都', value: '成都', province: '四川省' },
        { label: '绵阳', value: '绵阳', province: '四川省' },
        { label: '银川', value: '银川', province: '宁夏回族自治区' },
        { label: '石嘴山', value: '石嘴山', province: '宁夏回族自治区' }
      ]
      setCities(mockCities)
    }
  }

  // 照片和视频上传处理
  const handlePhotoUpload = async (file) => {
    try {
      // 检查文件类型
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        Toast.show({
          content: '请选择图片或视频文件',
          position: 'center'
        })
        throw new Error('文件类型不正确')
      }

      // 检查文件大小（限制10MB）
      if (file.size > 10 * 1024 * 1024) {
        Toast.show({
          content: '文件大小不能超过10MB',
          position: 'center'
        })
        throw new Error('文件过大')
      }

      let processedFile = file

      // 如果是图片，进行压缩处理
      if (file.type.startsWith('image/')) {
        Toast.show({
          content: '正在压缩图片...',
          position: 'center',
          duration: 1000
        })

        try {
          processedFile = await compressImage(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.8,
            maxSize: 500 * 1024 // 500KB
          })

          console.log(`图片压缩: ${(file.size / 1024).toFixed(1)}KB → ${(processedFile.size / 1024).toFixed(1)}KB`)
        } catch (compressError) {
          console.warn('图片压缩失败，使用原文件:', compressError)
          processedFile = file
        }
      }

      // 显示上传中提示
      Toast.show({
        content: '正在上传...',
        position: 'center',
        duration: 1000
      })

      // 这里应该实现真实的图片上传逻辑
      // 暂时使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 1000)) // 模拟上传延迟

      const imageUrl = URL.createObjectURL(processedFile)

      Toast.show({
        content: '上传成功',
        position: 'center'
      })

      return {
        url: imageUrl
      }
    } catch (error) {
      console.error('照片上传失败:', error)
      Toast.show({
        content: '上传失败，请重试',
        position: 'center'
      })
      throw error
    }
  }

  // 提交表单
  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 处理照片数据
      const photoUrls = photos.map(photo => photo.url)
      
      const profileData = {
        realName: values.realName,
        gender: values.gender,
        age: parseInt(values.age),
        height: values.height,
        weight: values.weight,
        experience: values.experience,
        services: values.services,
        city: values.city,
        district: values.district,
        photos: photoUrls
      }

      const response = await axios.post('/api/technicians/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      Toast.show({
        content: '技师资料创建成功，等待管理员审核',
        position: 'center'
      })

      // 跳转到技师工作台
      navigate('/technician/dashboard')

    } catch (error) {
      console.error('创建技师资料失败:', error)

      // 检查是否是认证错误（登录过期）
      if (error.response?.status === 401) {
        // 清除过期的登录信息
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userId')

        Toast.show({
          content: '登录已过期，请重新登录。您的资料未保存，请重新登录后再次创建。',
          position: 'center',
          duration: 5000
        })

        // 3秒后跳转到登录页
        setTimeout(() => {
          navigate('/login')
        }, 3000)
        return
      }

      Toast.show({
        content: error.response?.data?.message || '创建失败，请重试',
        position: 'center'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingBottom: '80px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        backIcon={<LeftOutline />}
      >
        创建技师资料
      </NavBar>

      {/* 提示信息 */}
      <Card style={{ margin: '16px' }}>
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <UserOutline style={{ fontSize: '48px', color: '#667eea', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>完善技师资料</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            请如实填写个人信息，资料提交后需要管理员审核通过才能接单
          </p>
        </div>
      </Card>

      {/* 资料表单 */}
      <Card style={{ margin: '0 16px 16px 16px' }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          footer={
            <Button 
              block 
              type="submit" 
              color="primary" 
              size="large"
              loading={loading}
            >
              提交审核
            </Button>
          }
        >
          {/* 基本信息 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>基本信息</h4>
            
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input placeholder="请输入昵称" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Selector
                options={[
                  { label: '女', value: '女' },
                  { label: '男', value: '男' }
                ]}
                placeholder="请选择性别"
              />
            </Form.Item>

            <Form.Item
              name="age"
              label="年龄"
              rules={[
                { required: true, message: '请输入年龄' },
                { pattern: /^(1[8-9]|[2-5][0-9]|60)$/, message: '年龄必须在18-60之间' }
              ]}
            >
              <Input placeholder="请输入年龄" type="number" />
            </Form.Item>

            <Form.Item
              name="height"
              label="身高"
              rules={[
                { required: true, message: '请输入身高' },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    const num = parseInt(value)
                    if (num < 150 || num > 200) {
                      return Promise.reject(new Error('身高请输入150-200之间的数字'))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input
                placeholder="请输入身高(cm)"
                type="number"
                min="150"
                max="200"
                suffix="cm"
              />
            </Form.Item>

            <Form.Item
              name="weight"
              label="体重"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve() // 体重是选填的
                    const num = parseInt(value)
                    if (num < 40 || num > 150) {
                      return Promise.reject(new Error('体重请输入40-150之间的数字'))
                    }
                    return Promise.resolve()
                  }
                }
              ]}
            >
              <Input
                placeholder="请输入体重(kg)"
                type="number"
                min="40"
                max="150"
                suffix="kg"
              />
            </Form.Item>
          </div>

          <Divider />

          {/* 特长信息 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>特长信息</h4>

            <Form.Item
              name="services"
              label="服务项目"
              rules={[{ required: true, message: '请选择服务项目' }]}
            >
              <Selector
                options={[
                  { label: '项目一，498 60分钟', value: '项目一，498 60分钟' },
                  { label: '项目二，598 80分钟', value: '项目二，598 80分钟' },
                  { label: '项目三，698 90分钟', value: '项目三，698 90分钟' }
                ]}
                multiple
                placeholder="请选择您提供的服务项目"
              />
            </Form.Item>

            <Form.Item
              name="specialties"
              label="个人特长"
              rules={[{ required: true, message: '请介绍您的个人特长' }]}
            >
              <TextArea
                placeholder="请详细介绍您的个人特长、专业技能等（建议100字以上）"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </div>

          <Divider />

          {/* 地区信息 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>服务地区</h4>

            <Form.Item
              name="province"
              label="所在省份"
              rules={[{ required: true, message: '请选择所在省份' }]}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Input
                  placeholder="请选择您的服务省份"
                  value={selectedProvince}
                  readOnly
                  style={{ flex: 1 }}
                />
                <Button
                  size="small"
                  color="primary"
                  onClick={() => setShowProvinceSelector(true)}
                >
                  选择
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="city"
              label="所在城市"
              rules={[{ required: true, message: '请选择所在城市' }]}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Input
                  placeholder={selectedProvince ? "请选择城市" : "请先选择省份"}
                  value={selectedCity}
                  readOnly
                  disabled={!selectedProvince}
                  style={{ flex: 1 }}
                />
                <Button
                  size="small"
                  color="primary"
                  disabled={!selectedProvince}
                  onClick={() => selectedProvince && setShowCitySelector(true)}
                >
                  选择
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="district"
              label="服务区域"
              rules={[{ required: true, message: '请选择服务区域' }]}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Input
                  placeholder="请选择具体服务区域"
                  value={selectedLocation}
                  readOnly
                  style={{ flex: 1 }}
                />
                <Button
                  size="small"
                  color="primary"
                  onClick={handleSelectLocation}
                >
                  选择位置
                </Button>
              </div>
            </Form.Item>
          </div>

          <Divider />

          {/* 照片上传 */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>个人照片</h4>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#999' }}>
              请上传个人照片和视频，将在客户端展示
            </p>
            
            <ImageUploader
              value={photos}
              onChange={setPhotos}
              upload={handlePhotoUpload}
              multiple
              accept="image/*,video/*"
              style={{
                '--cell-size': '100px',
                '--cell-gap': '8px'
              }}
            >
              <div style={{
                width: '100px',
                height: '100px',
                border: '2px dashed #1677ff',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1677ff',
                backgroundColor: '#f6f8ff',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
                <CameraOutline style={{ fontSize: '28px', marginBottom: '4px' }} />
                <span style={{ fontSize: '12px', textAlign: 'center', lineHeight: '1.2' }}>
                  点击上传<br/>照片/视频
                </span>
              </div>
            </ImageUploader>

            <div style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '8px',
              textAlign: 'center'
            }}>
              已上传 {photos.length} 个文件，支持JPG、PNG、MP4格式，图片自动压缩至500KB以下
            </div>
          </div>
        </Form>
      </Card>

      {/* 注意事项 */}
      <Card title="注意事项" style={{ margin: '0 16px 16px 16px' }}>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          <p>• 请确保所有信息真实有效，虚假信息将被拒绝</p>
          <p>• 照片和视频要求清晰、真实，不得使用他人内容</p>
          <p>• 审核通过后即可开始接单服务</p>
          <p>• 如有疑问请联系客服：400-123-4567</p>
        </div>
      </Card>

      {/* 省份滑动选择器 */}
      <Popup
        visible={showProvinceSelector}
        onMaskClick={() => setShowProvinceSelector(false)}
        position="bottom"
        bodyStyle={{ height: '50vh' }}
      >
        <div style={{ padding: '0' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fff'
          }}>
            <Button
              size="small"
              fill="none"
              onClick={() => setShowProvinceSelector(false)}
              style={{ color: '#999' }}
            >
              取消
            </Button>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>选择省份</span>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                if (selectedProvince) {
                  handleProvinceChange([selectedProvince])
                }
              }}
            >
              确定
            </Button>
          </div>
          <div style={{ height: 'calc(50vh - 60px)', overflow: 'hidden' }}>
            <PickerView
              columns={[provinces]}
              value={selectedProvince ? [selectedProvince] : [provinces[0]?.value]}
              onChange={(value) => setSelectedProvince(value[0])}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </Popup>

      {/* 城市滑动选择器 */}
      <Popup
        visible={showCitySelector}
        onMaskClick={() => setShowCitySelector(false)}
        position="bottom"
        bodyStyle={{ height: '50vh' }}
      >
        <div style={{ padding: '0' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fff'
          }}>
            <Button
              size="small"
              fill="none"
              onClick={() => setShowCitySelector(false)}
              style={{ color: '#999' }}
            >
              取消
            </Button>
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>选择城市</span>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                if (selectedCity) {
                  handleCityChange([selectedCity])
                }
              }}
            >
              确定
            </Button>
          </div>
          <div style={{ height: 'calc(50vh - 60px)', overflow: 'hidden' }}>
            <PickerView
              columns={[availableCities]}
              value={selectedCity ? [selectedCity] : availableCities.length > 0 ? [availableCities[0]?.value] : []}
              onChange={(value) => setSelectedCity(value[0])}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </Popup>
    </div>
  )
}

export default TechnicianProfileCreate
