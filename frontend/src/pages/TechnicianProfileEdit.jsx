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
  Switch,
  Divider,
  Popup,
  PickerView
} from 'antd-mobile'
import {
  LeftOutline,
  CameraOutline
} from 'antd-mobile-icons'
import axios from 'axios'
import { compressImage } from '../utils/imageCompress'
import { handleAuthError, checkAuthOnLoad, getAuthHeaders } from '../utils/authUtils'

const TechnicianProfileEdit = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState([])
  const [provinces, setProvinces] = useState([])
  const [availableCities, setAvailableCities] = useState([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [showProvinceSelector, setShowProvinceSelector] = useState(false)
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [photos, setPhotos] = useState([])
  const [technicianInfo, setTechnicianInfo] = useState(null)

  // 服务项目选项
  const serviceOptions = [
    { label: '全身按摩', value: '全身按摩' },
    { label: 'SPA护理', value: 'SPA护理' },
    { label: '精油按摩', value: '精油按摩' },
    { label: '深度按摩', value: '深度按摩' },
    { label: '肩颈护理', value: '肩颈护理' },
    { label: '足疗按摩', value: '足疗按摩' },
    { label: '淋巴排毒', value: '淋巴排毒' },
    { label: '美容护理', value: '美容护理' }
  ]



  useEffect(() => {
    checkAuth()
    loadCities()
    loadTechnicianProfile()
  }, [])

  const checkAuth = () => {
    // 使用通用的认证检查，要求TECHNICIAN角色
    checkAuthOnLoad(navigate, 'TECHNICIAN')
  }

  const loadCities = async () => {
    try {
      const response = await axios.get('/api/technicians/cities/list')
      const cityData = response.data

      // 处理省份数据
      const provinceOptions = Object.keys(cityData.citiesByProvince).map(province => ({
        label: province,
        value: province
      }))
      setProvinces(provinceOptions)

      // 处理城市数据
      const cityOptions = cityData.allCities.map(city => ({
        label: city.name,
        value: city.name,
        province: city.province
      }))
      setCities(cityOptions)

      console.log('加载的省份数据:', provinceOptions)
      console.log('加载的城市数据:', cityOptions)
    } catch (error) {
      console.error('加载城市数据失败:', error)
    }
  }

  // 处理省份选择
  const handleProvinceChange = (value) => {
    const province = value[0]
    setSelectedProvince(province)
    setSelectedCity('') // 清空城市选择
    form.setFieldsValue({ province: province, city: '' })

    // 过滤出该省份的城市
    const provinceCities = cities.filter(city => city.province === province)
    setAvailableCities(provinceCities)

    setShowProvinceSelector(false)
    console.log('选择的省份:', province)
    console.log('该省份的城市:', provinceCities)
  }

  // 处理城市选择
  const handleCityChange = (value) => {
    setSelectedCity(value[0])
    form.setFieldsValue({ city: value[0] })
    setShowCitySelector(false)
  }

  const loadTechnicianProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/technicians/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const profile = response.data.profile
      setTechnicianInfo(profile)
      
      // 设置表单初始值
      form.setFieldsValue({
        realName: profile.realName,
        gender: profile.gender,
        age: profile.age?.toString(),
        height: profile.height,
        weight: profile.weight,
        experience: profile.experience,
        services: JSON.parse(profile.services || '[]'),
        city: profile.city,
        district: profile.district,
        isAvailable: profile.isAvailable
      })
      
      // 设置照片
      const photoList = JSON.parse(profile.photos || '[]').map((url, index) => ({
        url,
        key: index
      }))
      setPhotos(photoList)
      
    } catch (error) {
      console.error('加载技师资料失败:', error)
      if (error.response?.status === 404) {
        Toast.show({
          content: '技师资料不存在，请先创建',
          position: 'center'
        })
        navigate('/technician/profile/create')
      }
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

      // 确保身高体重格式正确
      let height = values.height
      let weight = values.weight

      if (height && !height.endsWith('cm')) {
        height = height + 'cm'
      }
      if (weight && !weight.endsWith('kg')) {
        weight = weight + 'kg'
      }

      const profileData = {
        realName: values.realName,
        gender: values.gender,
        age: parseInt(values.age),
        height: height,
        weight: weight,
        experience: values.experience,
        services: values.services || [],
        city: values.city,
        district: values.district,
        photos: photoUrls,
        isAvailable: values.isAvailable
      }

      console.log('提交的数据:', profileData)

      const response = await axios.put('/api/technicians/profile', profileData, {
        headers: getAuthHeaders()
      })

      Toast.show({
        content: '技师资料更新成功',
        position: 'center'
      })

      // 返回工作台
      navigate('/technician/dashboard')

    } catch (error) {
      console.error('更新技师资料失败:', error)
      console.error('错误详情:', error.response?.data)

      let errorMessage = '更新失败，请重试'

      // 使用通用的认证错误处理
      if (handleAuthError(error, navigate)) {
        return // 如果是认证错误，已经处理了，直接返回
      }

      if (error.response?.data?.details) {
        // 显示验证错误详情
        const details = error.response.data.details
        if (Array.isArray(details)) {
          errorMessage = details.map(d => d.msg).join(', ')
        } else {
          errorMessage = error.response.data.message || errorMessage
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      Toast.show({
        content: errorMessage,
        position: 'center',
        duration: 3000
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
        编辑技师资料
      </NavBar>

      {/* 认证状态提示 */}
      {technicianInfo && (
        <Card style={{ margin: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <div>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                认证状态：
                <span style={{ 
                  color: technicianInfo.isVerified ? '#00b578' : '#ff8f1f',
                  marginLeft: '8px'
                }}>
                  {technicianInfo.isVerified ? '已认证' : '待审核'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {technicianInfo.isVerified 
                  ? '您的资料已通过审核，可以正常接单' 
                  : '资料正在审核中，请耐心等待'
                }
              </div>
            </div>
          </div>
        </Card>
      )}

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
              保存修改
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

          {/* 工作信息 */}
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
                placeholder="请详细介绍您的个人特长、专业技能等"
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="isAvailable"
              label="接单状态"
            >
              <Switch />
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
                  style={{ flex: 1 }}
                />
                <Button
                  size="small"
                  color="primary"
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

export default TechnicianProfileEdit
