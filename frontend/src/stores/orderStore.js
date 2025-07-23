import { create } from 'zustand';
import { orderAPI, paymentAPI } from '../services/api';

/**
 * 订单状态管理
 */
const useOrderStore = create((set, get) => ({
  // 状态
  orders: [],
  currentOrder: null,
  currentPayment: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },

  // 创建订单
  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.create(orderData);
      const order = response.data.order;
      
      set({
        currentOrder: order,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: order };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '创建订单失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 获取订单列表
  fetchOrders: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.getList(params);
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

  // 获取订单详情
  fetchOrderDetail: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.getDetail(orderId);
      const order = response.data.order;
      
      set({
        currentOrder: order,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: order };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '获取订单详情失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 取消订单
  cancelOrder: async (orderId, reason) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.cancel(orderId, reason);
      const order = response.data.order;
      
      // 更新当前订单状态
      if (get().currentOrder?.id === orderId) {
        set({ currentOrder: order });
      }
      
      // 更新订单列表中的状态
      const orders = get().orders.map(o => 
        o.id === orderId ? order : o
      );
      
      set({
        orders,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: order };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '取消订单失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 创建支付订单
  createPayment: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentAPI.createDeposit(orderId);
      const payment = response.data.payment;
      
      set({
        currentPayment: payment,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: payment };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '创建支付订单失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 查询支付状态
  queryPaymentStatus: async (paymentId) => {
    try {
      const response = await paymentAPI.queryStatus(paymentId);
      const payment = response.data.payment;
      
      set({ currentPayment: payment });
      
      return { success: true, data: payment };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '查询支付状态失败';
      return { success: false, error: errorMessage };
    }
  },

  // 技师确认尾款
  confirmFinalPayment: async (orderId, paymentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await orderAPI.confirmFinalPayment(orderId, paymentData);
      const order = response.data.order;
      
      // 更新当前订单状态
      if (get().currentOrder?.id === orderId) {
        set({ currentOrder: order });
      }
      
      // 更新订单列表中的状态
      const orders = get().orders.map(o => 
        o.id === orderId ? order : o
      );
      
      set({
        orders,
        isLoading: false,
        error: null
      });
      
      return { success: true, data: order };
    } catch (error) {
      const errorMessage = error.response?.data?.message || '确认尾款失败';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // 清除错误
  clearError: () => {
    set({ error: null });
  },

  // 清除当前订单
  clearCurrentOrder: () => {
    set({ currentOrder: null });
  },

  // 清除当前支付
  clearCurrentPayment: () => {
    set({ currentPayment: null });
  },

  // 重置订单状态
  resetOrderState: () => {
    set({
      orders: [],
      currentOrder: null,
      currentPayment: null,
      error: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
    });
  }
}));

export default useOrderStore;
