import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || `http://localhost:5000/api`}/wishlist`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Service wishlist (yêu thích) — lưu trên DB thay vì localStorage.
export const wishlistService = {
  // Danh sách yêu thích kèm chi tiết sản phẩm (name, giá, ảnh, brand, category).
  getWishlist: async () => {
    try {
      const res = await axios.get(API_URL, authHeaders());
      return res.data.data || res.data.items || [];
    } catch (error) {
      console.error('Lỗi lấy danh sách yêu thích:', error);
      return [];
    }
  },

  // Chỉ lấy mảng product_id đã thích (nhẹ, để tô tim / đếm nhanh).
  getProductIds: async () => {
    try {
      const res = await axios.get(`${API_URL}/ids`, authHeaders());
      return res.data.data || res.data.productIds || [];
    } catch (error) {
      console.error('Lỗi lấy id yêu thích:', error);
      return [];
    }
  },

  add: async (productId) => {
    const res = await axios.post(API_URL, { product_id: productId }, authHeaders());
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
    return res.data;
  },

  remove: async (productId) => {
    const res = await axios.delete(`${API_URL}/${productId}`, authHeaders());
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
    return res.data;
  },

  // Bật/tắt trong 1 lần gọi; trả { isFavorite, message }.
  toggle: async (productId) => {
    const res = await axios.post(`${API_URL}/toggle`, { product_id: productId }, authHeaders());
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
    return res.data;
  },
};
