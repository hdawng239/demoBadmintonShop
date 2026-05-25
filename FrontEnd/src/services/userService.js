import axios from 'axios';

const API_URL = 'https://demobadmintonshop-production.up.railway.app/api/users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const userService = {
  getUserProfile: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  },

  updateUserProfile: async (userId, data) => {
    try {
      const response = await axios.put(`${API_URL}/${userId}`, data, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  }
};
