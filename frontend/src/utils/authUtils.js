import { Toast } from 'antd-mobile'

/**
 * 处理认证错误的通用函数
 * @param {Object} error - axios错误对象
 * @param {Function} navigate - react-router的navigate函数
 * @returns {boolean} - 如果是认证错误返回true，否则返回false
 */
export const handleAuthError = (error, navigate) => {
  // 检查是否是认证错误（401状态码）
  if (error.response?.status === 401) {
    // 清除过期的登录信息
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    
    // 显示友好的提示信息
    Toast.show({
      content: '登录已过期，请重新登录。您的操作未保存，请重新登录后再试。',
      position: 'center',
      duration: 5000
    })
    
    // 延迟跳转到登录页，让用户看到提示
    setTimeout(() => {
      navigate('/login')
    }, 3000)
    
    return true // 表示已处理认证错误
  }
  
  return false // 不是认证错误
}

/**
 * 检查token是否存在且有效
 * @returns {boolean} - token是否有效
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    // 简单检查token格式（JWT通常有3个部分，用.分隔）
    const parts = token.split('.')
    if (parts.length !== 3) return false
    
    // 解码payload检查过期时间
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // 如果token已过期，清除本地存储
    if (payload.exp && payload.exp < now) {
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userId')
      return false
    }
    
    return true
  } catch (error) {
    // token格式错误，清除本地存储
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    return false
  }
}

/**
 * 获取认证头部
 * @returns {Object} - 包含Authorization头的对象
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * 在页面加载时检查认证状态
 * @param {Function} navigate - react-router的navigate函数
 * @param {string} requiredRole - 需要的用户角色（可选）
 * @returns {boolean} - 认证是否有效
 */
export const checkAuthOnLoad = (navigate, requiredRole = null) => {
  if (!isTokenValid()) {
    Toast.show({
      content: '请先登录',
      position: 'center'
    })
    navigate('/login')
    return false
  }
  
  // 检查用户角色
  if (requiredRole) {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== requiredRole) {
      Toast.show({
        content: '权限不足',
        position: 'center'
      })
      navigate('/login')
      return false
    }
  }
  
  return true
}
