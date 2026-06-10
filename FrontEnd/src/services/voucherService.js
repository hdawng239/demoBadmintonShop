import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/vouchers`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const voucherService = {
  // Client APIs
  getActiveVouchers: async () => {
    try {
      const response = await axios.get(`${API_URL}/active`, getAuthHeaders());
      return response.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách voucher hoạt động:", error);
      return [];
    }
  },

  applyVoucher: async (code, cartTotal) => {
    try {
      const response = await axios.post(`${API_URL}/apply`, { code, cartTotal }, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin APIs
  adminGetVouchers: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/admin?page=${page}&limit=${limit}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  adminGetVoucherById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/admin/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  adminCreateVoucher: async (voucherData) => {
    try {
      const response = await axios.post(`${API_URL}/admin`, voucherData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  adminUpdateVoucher: async (id, voucherData) => {
    try {
      const response = await axios.put(`${API_URL}/admin/${id}`, voucherData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  adminDeleteVoucher: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/admin/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
