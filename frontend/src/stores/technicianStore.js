import { create } from 'zustand';
import { technicianAPI } from '../services/api';

/**
 * 技师状态管理
 */
const useTechnicianStore = create((set, get) => ({
  // 状态
  technicians: [],
  currentTechnician: null,
  technicianProfile: null,
  stats: null,
  orders: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  filters: {
    city: '',
    services: [],
    sortBy: 'rating'
  },

  // 获取技师列表
  fetchTechnicians: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await technicianAPI.getList({
        ...get().filters,
        ...params
      });
      
      const { technicians, pagination } = response.data;
      
      set({
        technicians,
        pagination,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: technicians };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '获取技师列表失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 获取技师详情
  fetchTechnicianDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await technicianAPI.getDetail(id);
      const technician = response.data.technician;
      
      set({
        currentTechnician: technician,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: technician };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '获取技师详情失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 获取技师自己的资料
  fetchTechnicianProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await technicianAPI.getProfile();
      const profile = response.data.profile;
      
      set({
        technicianProfile: profile,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: profile };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '获取技师资料失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 创建技师资料
  createTechnicianProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await technicianAPI.createProfile(profileData);
      const profile = response.data.profile;
      
      set({
        technicianProfile: profile,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: profile };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '创建技师资料失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 更新技师资料
  updateTechnicianProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await technicianAPI.updateProfile(profileData);
      const profile = response.data.profile;
      
      set({
        technicianProfile: profile,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: profile };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '更新技师资料失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 获取技师统计数据
  fetchTechnicianStats: async () => {
    try {
      const response = await technicianAPI.getStats();
      const stats = response.data.stats;
      
      set({ stats });
      
      return { success: true, data: stats };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '获取统计数据失败';
      return { success: false, error: errorMessage };
    }
  },

  // 获取技师订单
  fetchTechnicianOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await technicianAPI.getOrders(params);
      const { orders, pagination } = response.data;
      
      set({
        orders,
        pagination,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: orders };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '获取订单列表失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 设置筛选条件
  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters }
    });
  },

  // 重置筛选条件
  resetFilters: () => {
    set({
      filters: {
        city: '',
        services: [],
        sortBy: 'rating'
      }
    });
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 清除当前技师
  clearCurrentTechnician: () => {
    set({ currentTechnician: null });
  },

  // 清除技师资料
  clearTechnicianProfile: () => {
    set({ technicianProfile: null });
  }
}));

export default useTechnicianStore;
