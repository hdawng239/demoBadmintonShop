import axios from 'axios';

const API_URL = 'https://demobadmintonshop-production.up.railway.app/api/post';

export const postService = {
  getAllPosts: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  },

  getPostById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  }
};
