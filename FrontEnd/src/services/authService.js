import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;

export const authService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const resData = response.data;
      const token = resData.token || resData.data?.token;
      const user = resData.user || resData.data?.user;
      const refreshToken = resData.refreshToken || resData.data?.refreshToken;

      if (token) {
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        localStorage.removeItem('guest_cart');
        window.dispatchEvent(new Event('userUpdated'));
        window.dispatchEvent(new Event('authChange'));
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
      return { token, user, refreshToken, ...resData };
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  },

  register: async (full_name, email, phone, address, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        full_name,
        email,
        phone,
        address,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await axios.post(`${API_URL}/logout`, { refreshToken });
      } catch (_) { /* ignore */ }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('guest_cart');
    window.dispatchEvent(new Event('userUpdated'));
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('Không có refresh token');
    const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
    const resData = response.data;
    const newToken = resData.token || resData.data?.token;
    const newRefreshToken = resData.refreshToken || resData.data?.refreshToken;

    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    return newToken;
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getCaptcha: async () => {
    try {
      const response = await axios.get(`${API_URL}/captcha`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server khi tải Captcha" };
    }
  },

  forgotPassword: async (email, captchaAnswer, captchaToken) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email, captchaAnswer, captchaToken });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  }
};
