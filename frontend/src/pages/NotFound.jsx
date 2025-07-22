import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd-mobile'
import { ExclamationCircleOutline } from 'antd-mobile-icons'
import './NotFound.css'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <ExclamationCircleOutline style={{ fontSize: '64px', color: '#ff6b6b' }} />
        <h1>404</h1>
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在或已被删除</p>
        
        <Space direction="vertical" style={{ width: '100%', marginTop: '32px' }}>
          <Button 
            color="primary" 
            size="large" 
            block
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
          <Button 
            color="default" 
            size="large" 
            block
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default NotFound
