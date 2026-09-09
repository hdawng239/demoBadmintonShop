import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth`;
const authHttp = axios.create({ withCredentials: true, timeout: 10000 });
const withSessionLock = (operation) => navigator.locks
  ? navigator.locks.request('naro-session', operation)
  : operation();

export const authService = {
  login: async (email, password) => withSessionLock(async () => {
    try {
      const response = await authHttp.post(`${API_URL}/login`, { email, password });
      const resData = response.data;
      const token = resData.token || resData.data?.token;
      const user = resData.user || resData.data?.user;
      const csrfToken = resData.csrfToken || resData.data?.csrfToken;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.removeItem('refreshToken');
        if (csrfToken) localStorage.setItem('csrfToken', csrfToken);
        sessionStorage.removeItem('csrfToken');
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        localStorage.removeItem('guest_cart');
        window.dispatchEvent(new Event('userUpdated'));
        window.dispatchEvent(new Event('authChange'));
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('wishlistUpdated'));
      }
      return { token, user, ...resData };
    } catch (error) {
      throw error.response?.data || { message: "Lỗi kết nối server" };
    }
  }),

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

  logout: async () => withSessionLock(async () => {
    const csrfToken = localStorage.getItem('csrfToken') || sessionStorage.getItem('csrfToken');
    if (csrfToken) {
      try {
        await authHttp.post(`${API_URL}/logout`, {}, { headers: { 'x-csrf-token': csrfToken } });
      } catch (_) {   }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('guest_cart');
    localStorage.removeItem('csrfToken');
    sessionStorage.removeItem('csrfToken');
    window.dispatchEvent(new Event('userUpdated'));
    window.dispatchEvent(new Event('authChange'));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('wishlistUpdated'));
    window.dispatchEvent(new Event('favoritesUpdated'));
  }),

  refreshToken: async (failedToken) => withSessionLock(async () => {
    const currentToken = localStorage.getItem('token');
    if (failedToken && currentToken && currentToken !== failedToken) return currentToken;
    const csrfToken = localStorage.getItem('csrfToken') || sessionStorage.getItem('csrfToken');
    if (!csrfToken) throw new Error('Không có CSRF token');
    let response;
    try {
      response = await authHttp.post(`${API_URL}/refresh-token`, {}, { headers: { 'x-csrf-token': csrfToken } });
    } catch (err) {
      // Giữ phiên mới của tab khác khi trình duyệt không có Web Locks.
      if (err.response?.status === 401 && localStorage.getItem('csrfToken') !== csrfToken && localStorage.getItem('token')) {
        return localStorage.getItem('token');
      }
      throw err;
    }
    const resData = response.data;
    const newToken = resData.token || resData.data?.token;
    const newCsrfToken = resData.csrfToken || resData.data?.csrfToken;

    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    if (newCsrfToken) localStorage.setItem('csrfToken', newCsrfToken);
    sessionStorage.removeItem('csrfToken');
    return newToken;
  }),

  setCurrentUser: (user) => localStorage.setItem('user', JSON.stringify(user)),

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

  forgotPassword: async (email, turnstileToken) => {
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email, turnstileToken });
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
