import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://localhost:5000/api`;

export const ghnService = {
  getProvinces: async () => {
    try {
      const response = await axios.get(`${API_URL}/ghn/provinces`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server GHN" };
    }
  },

  getDistricts: async (provinceId) => {
    try {
      const response = await axios.post(`${API_URL}/ghn/districts`, { province_id: parseInt(provinceId) });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server GHN" };
    }
  },

  getWards: async (districtId) => {
    try {
      const response = await axios.post(`${API_URL}/ghn/wards`, { district_id: parseInt(districtId) });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server GHN" };
    }
  },

  calculateShippingFee: async (payload) => {
    try {
      const response = await axios.post(`${API_URL}/ghn/shipping-fee`, payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server GHN" };
    }
  }
};
