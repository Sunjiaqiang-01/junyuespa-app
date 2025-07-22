import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  NavBar,
  Card,
  Button,
  Form,
  Input,
  Selector,
  DatePicker,
  Toast,
  Space,
  Divider,
  TextArea
} from 'antd-mobile'
import { 
  LeftOutline, 
  EnvironmentOutline,
  ClockCircleOutline,
  UserOutline
} from 'antd-mobile-icons'
import axios from 'axios'
import dayjs from 'dayjs'

const Booking = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [technician, setTechnician] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  // 服务类型选项
  const serviceOptions = [
    { label: '全身按摩 (90分钟)', value: 'full_massage_90', duration: 90, price: 298 },
    { label: '全身按摩 (120分钟)', value: 'full_massage_120', duration: 120, price: 398 },
    { label: '精油SPA (90分钟)', value: 'oil_spa_90', duration: 90, price: 358 },
    { label: '精油SPA (120分钟)', value: 'oil_spa_120', duration: 120, price: 458 },
    { label: '深度按摩 (90分钟)', value: 'deep_massage_90', duration: 90, price: 328 },
    { label: '深度按摩 (120分钟)', value: 'deep_massage_120', duration: 120, price: 428 },
    { label: '肩颈护理 (60分钟)', value: 'neck_care_60', duration: 60, price: 198 },
    { label: '足疗按摩 (60分钟)', value: 'foot_massage_60', duration: 60, price: 168 }
  ]

  // 时间段选项
  const timeSlots = [
    { label: '09:00-10:30', value: '09:00' },
    { label: '10:30-12:00', value: '10:30' },
    { label: '14:00-15:30', value: '14:00' },
    { label: '15:30-17:00', value: '15:30' },
    { label: '17:00-18:30', value: '17:00' },
    { label: '19:00-20:30', value: '19:00' },
    { label: '20:30-22:00', value: '20:30' }
  ]

  // 加载技师信息
  useEffect(() => {
    loadTechnicianInfo()
  }, [id])

  const loadTechnicianInfo = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/technicians/${id}`)
      setTechnician(response.data.technician)
    } catch (error) {
      console.error('加载技师信息失败:', error)
      Toast.show({
        content: '加载失败，请重试',
        position: 'center'
      })
    } finally {
      setLoading(false)
    }
  }

  // 提交预约
  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const selectedService = serviceOptions.find(s => s.value === values.serviceType)
      
      const orderData = {
        technicianId: parseInt(id),
        serviceType: selectedService.label,
        serviceDuration: selectedService.duration,
        totalAmount: selectedService.price,
        serviceAddress: values.address,
        contactInfo: values.phone,
        scheduledTime: `${values.date} ${values.timeSlot}:00`
      }

      const response = await axios.post('/api/orders', orderData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      Toast.show({
        content: '预约成功！',
        position: 'center'
      })

      // 跳转到支付页面
      navigate(`/payment/${response.data.order.id}`)
      
    } catch (error) {
      console.error('预约失败:', error)
      Toast.show({
        content: error.response?.data?.message || '预约失败，请重试',
        position: 'center'
      })
    } finally {
      setSubmitting(false)
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
    <div style={{ paddingBottom: '80px' }}>
      {/* 导航栏 */}
      <NavBar
        back="返回"
        onBack={() => navigate(-1)}
        backIcon={<LeftOutline />}
      >
        预约服务
      </NavBar>

      {/* 技师信息 */}
      <Card style={{ margin: '0 0 8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={technician.photos?.[0] || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face'}
            alt={technician.name}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              objectFit: 'cover',
              marginRight: '12px'
            }}
          />
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
              {technician.name}
            </h3>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <span>{technician.age}岁 · {technician.height}</span>
              <span style={{ marginLeft: '12px' }}>
                <EnvironmentOutline style={{ fontSize: '12px', marginRight: '2px' }} />
                {technician.city} {technician.district}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 预约表单 */}
      <Card title="预约信息">
        <Form
          form={form}
          onFinish={handleSubmit}
          footer={
            <Button 
              block 
              type="submit" 
              color="primary" 
              size="large"
              loading={submitting}
            >
              确认预约
            </Button>
          }
        >
          <Form.Item
            name="serviceType"
            label="服务类型"
            rules={[{ required: true, message: '请选择服务类型' }]}
          >
            <Selector
              options={serviceOptions}
              placeholder="请选择服务类型"
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="预约日期"
            rules={[
              { required: true, message: '请选择预约日期' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve()
                  const selectedDate = dayjs(value)
                  const today = dayjs().startOf('day')
                  const maxDate = dayjs().add(30, 'day')

                  if (selectedDate.isBefore(today)) {
                    return Promise.reject(new Error('不能选择过去的日期'))
                  }
                  if (selectedDate.isAfter(maxDate)) {
                    return Promise.reject(new Error('最多只能预约30天内的日期'))
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <Input
              type="date"
              placeholder="请选择预约日期"
              min={dayjs().format('YYYY-MM-DD')}
              max={dayjs().add(30, 'day').format('YYYY-MM-DD')}
            />
          </Form.Item>

          <Form.Item
            name="timeSlot"
            label="预约时间"
            rules={[{ required: true, message: '请选择预约时间' }]}
          >
            <Selector
              options={timeSlots}
              placeholder="请选择时间段"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="服务地址"
            rules={[{ required: true, message: '请输入服务地址' }]}
          >
            <TextArea
              placeholder="请输入详细地址（如：XX小区XX栋XX室）"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Form>
      </Card>

      {/* 价格说明 */}
      <Card title="价格说明" style={{ margin: '8px 0 0 0' }}>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          <p>• 需支付50%定金确认预约</p>
          <p>• 服务完成后支付剩余50%</p>
          <p>• 预约成功后24小时内可免费取消</p>
          <p>• 技师上门服务，安全可靠</p>
        </div>
      </Card>
    </div>
  )
}

export default Booking
