import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/carts`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const cartService = {
  getMyCart: async () => {
    try {
      const response = await axios.get(`${API_URL}/my-cart`, getAuthHeaders());
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { items: [] }; // Giỏ hàng rỗng
      }
      throw error;
    }
  },

  addItemToCart: async (cartData) => {
    try {
      // Đầu tiên phải đảm bảo user có giỏ hàng, nếu chưa có thì API có thể tự tạo hoặc ta phải gọi
      // Nhưng theo controller addItemToCart gọi thẳng CartItem.createOrUpdate
      // Gửi: { cart_id, variant_id, quantity }
      // Do đó cần lấy cart_id trước. Nếu chưa có giỏ hàng thì phải tạo
      // Ở đây ta có thể tối ưu trên Backend tự tạo giỏ, nhưng nếu BE không tự tạo, ta xử lý ở đây:
      const response = await axios.post(`${API_URL}/items`, cartData, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateItemQuantity: async (itemId, quantity) => {
    try {
      const response = await axios.put(`${API_URL}/items/${itemId}`, { quantity }, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  removeItem: async (itemId) => {
    try {
      const response = await axios.delete(`${API_URL}/items/${itemId}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCart: async (userId) => {
    try {
      const response = await axios.post(API_URL, { user_id: userId }, getAuthHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
