import React, { useState } from 'react'
import { Form, Input, Button, Card, Toast, Space } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = {
        phone: values.phone,
        password: values.password,
        ...(isLogin ? {} : {
          role: 'CUSTOMER',
          inviteCode: values.inviteCode,
          nickname: values.nickname
        })
      }

      const response = await axios.post(endpoint, payload)
      
      if (response.data.token) {
        // 保存token到localStorage
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('userRole', response.data.user.role)
        localStorage.setItem('userId', response.data.user.id.toString())

        Toast.show({
          content: isLogin ? '登录成功！' : '注册成功！',
          position: 'center'
        })

        // 根据用户角色跳转
        if (response.data.user.role === 'TECHNICIAN') {
          navigate('/technician/dashboard')
        } else {
          navigate('/')
        }
      }
    } catch (error) {
      console.error('操作失败:', error)
      Toast.show({
        content: error.response?.data?.message || '操作失败，请重试',
        position: 'center'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      {/* 头部 */}
      <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
        <img
          src="/logo.png"
          alt="君悦彩虹SPA"
          style={{
            width: '100px',
            height: 'auto',
            marginBottom: '16px',
            borderRadius: '8px'
          }}
        />
        <h1 style={{
          fontSize: '24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '8px'
        }}>
          {isLogin ? '欢迎回来' : '加入我们'}
        </h1>
        <p style={{ color: '#666' }}>
          {isLogin ? '登录您的账户' : '创建新账户'}
        </p>
      </div>

      {/* 登录/注册表单 */}
      <Card>
        <Form
          onFinish={onFinish}
          footer={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                type="submit" 
                color="primary" 
                size="large"
                loading={loading}
              >
                {isLogin ? '登录' : '注册'}
              </Button>
              
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span style={{ color: '#666' }}>
                  {isLogin ? '还没有账户？' : '已有账户？'}
                </span>
                <Button 
                  fill="none" 
                  color="primary"
                  onClick={() => setIsLogin(!isLogin)}
                  style={{ padding: '0 8px' }}
                >
                  {isLogin ? '立即注册' : '立即登录'}
                </Button>
              </div>
            </Space>
          }
        >
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' }
            ]}
          >
            <Input type="password" placeholder="请输入密码" />
          </Form.Item>

          {!isLogin && (
            <>
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[
                  { required: true, message: '请输入昵称' }
                ]}
              >
                <Input placeholder="请输入昵称" />
              </Form.Item>

              <Form.Item
                name="inviteCode"
                label="邀请码"
                help="可选，填写邀请码可获得分佣奖励"
              >
                <Input placeholder="请输入邀请码（可选）" />
              </Form.Item>
            </>
          )}
        </Form>
      </Card>

      {/* 返回首页 */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Button 
          fill="none" 
          color="primary"
          onClick={() => navigate('/')}
        >
          返回首页
        </Button>
      </div>

      {/* 服务条款 */}
      <div style={{ 
        textAlign: 'center', 
        padding: '20px 0',
        color: '#999',
        fontSize: '12px'
      }}>
        <p>
          {isLogin ? '登录' : '注册'}即表示同意
          <span style={{ color: '#667eea' }}>《用户协议》</span>
          和
          <span style={{ color: '#667eea' }}>《隐私政策》</span>
        </p>
      </div>
    </div>
  )
}

export default Login
