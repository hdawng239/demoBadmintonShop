import axios from 'axios';
import { authService } from './authService';

const API_URL = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/reviews`;

export const reviewService = {
  getProductReviews: async (productId, page = 1, limit = 5) => {
    try {
      const response = await axios.get(`${API_URL}/product/${productId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
      return { reviews: [], totalItems: 0, totalPages: 1 };
    }
  },
  
  createReview: async (reviewData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(API_URL, reviewData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
