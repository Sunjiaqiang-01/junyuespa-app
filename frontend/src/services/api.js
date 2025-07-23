import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (
    import.meta.env.PROD
      ? 'https://api.junyue.app/api'  // 生产环境
      : 'http://localhost:3000/api'   // 开发环境
  ),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理通用错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * 认证相关API
 */
export const authAPI = {
  // 用户注册
  register: (data) => api.post('/auth/register', data),
  
  // 用户登录
  login: (data) => api.post('/auth/login', data),
  
  // 验证token
  verify: () => api.get('/auth/verify'),
  
  // 刷新token
  refresh: () => api.post('/auth/refresh')
};

/**
 * 用户相关API
 */
export const userAPI = {
  // 获取用户信息
  getProfile: () => api.get('/users/profile'),
  
  // 更新用户信息
  updateProfile: (data) => api.put('/users/profile', data),
  
  // 上传头像
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

/**
 * 技师相关API
 */
export const technicianAPI = {
  // 获取技师列表
  getList: (params) => api.get('/technicians', { params }),
  
  // 获取技师详情
  getDetail: (id) => api.get(`/technicians/${id}`),
  
  // 获取技师自己的资料
  getProfile: () => api.get('/technicians/profile'),
  
  // 创建技师资料
  createProfile: (data) => api.post('/technicians/profile', data),
  
  // 更新技师资料
  updateProfile: (data) => api.put('/technicians/profile', data),
  
  // 获取技师统计数据
  getStats: () => api.get('/technicians/stats'),
  
  // 获取技师订单
  getOrders: (params) => api.get('/orders/technician/orders', { params })
};

/**
 * 订单相关API
 */
export const orderAPI = {
  // 创建订单
  create: (data) => api.post('/orders', data),
  
  // 获取订单列表
  getList: (params) => api.get('/orders', { params }),
  
  // 获取订单详情
  getDetail: (id) => api.get(`/orders/${id}`),
  
  // 取消订单
  cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
  
  // 技师确认尾款
  confirmFinalPayment: (id, data) => api.post(`/orders/${id}/confirm-final-payment`, data)
};

/**
 * 支付相关API
 */
export const paymentAPI = {
  // 创建支付订单（定金）
  createDeposit: (orderId) => api.post('/payments/deposit', { orderId }),
  
  // 查询支付状态
  queryStatus: (paymentId) => api.get(`/payments/${paymentId}/status`),
  
  // 申请退款
  refund: (paymentId, reason) => api.post(`/payments/${paymentId}/refund`, { reason })
};

/**
 * 管理员相关API
 */
export const adminAPI = {
  // 获取技师列表
  getTechnicians: (params) => api.get('/admin/technicians', { params }),
  
  // 获取技师详情
  getTechnicianDetail: (id) => api.get(`/admin/technicians/${id}`),
  
  // 审核技师
  verifyTechnician: (id, data) => api.post(`/admin/technicians/${id}/verify`, data),
  
  // 联系技师
  contactTechnician: (id, data) => api.post(`/admin/technicians/${id}/contact`, data),
  
  // 获取联系记录
  getContacts: (params) => api.get('/admin/contacts', { params })
};

/**
 * 城市相关API
 */
export const cityAPI = {
  // 获取城市列表
  getList: () => api.get('/cities'),
  
  // 按省份获取城市
  getByProvince: (province) => api.get(`/cities/province/${province}`)
};

/**
 * 文件上传API
 */
export const uploadAPI = {
  // 上传图片
  uploadImage: (file, type = 'general') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // 批量上传图片
  uploadImages: (files, type = 'general') => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    formData.append('type', type);
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

/**
 * 通用请求方法
 */
export const request = {
  get: (url, params) => api.get(url, { params }),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url)
};

export default api;
