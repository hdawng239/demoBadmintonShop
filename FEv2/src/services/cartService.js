import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/carts`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const cartService = {
  // Lấy giỏ hàng của user từ server (chỉ cho user đã đăng nhập)
  getMyCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { items: [] };
    }

    try {
      const response = await axios.get(`${API_URL}/my-cart`, getAuthHeaders());
      const data = response.data;
      const items = data?.items || (Array.isArray(data) ? data : []);
      return {
        ...data,
        items
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { items: [] };
      }
      console.warn('Lỗi lấy giỏ hàng từ server:', error);
      return { items: [] };
    }
  },

  // Thêm sản phẩm vào giỏ (yêu cầu đăng nhập, lưu trực tiếp vào database)
  addToCart: async (product, quantity = 1, selectedVariant = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('VUI_LONG_DANG_NHAP');
    }

    let variantId = selectedVariant?.id;
    if (!variantId && product.variants && product.variants.length > 0) {
      variantId = product.variants[0].id;
    }

    if (!variantId) {
      throw new Error('Vui lòng chọn phân loại sản phẩm!');
    }

    const response = await axios.post(`${API_URL}/items`, {
      variant_id: variantId,
      quantity: quantity
    }, getAuthHeaders());

    window.dispatchEvent(new Event('cartUpdated'));
    return response.data;
  },

  // Cập nhật số lượng
  updateQuantity: async (itemId, quantity) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('VUI_LONG_DANG_NHAP');
    }

    await axios.put(`${API_URL}/items/${itemId}`, { quantity }, getAuthHeaders());
    const freshCart = await cartService.getMyCart();
    window.dispatchEvent(new Event('cartUpdated'));
    return freshCart;
  },

  // Xóa sản phẩm khỏi giỏ
  removeFromCart: async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('VUI_LONG_DANG_NHAP');
    }

    await axios.delete(`${API_URL}/items/${itemId}`, getAuthHeaders());
    const freshCart = await cartService.getMyCart();
    window.dispatchEvent(new Event('cartUpdated'));
    return freshCart;
  },

  clearCart: async () => {
    window.dispatchEvent(new Event('cartUpdated'));
  }
};
