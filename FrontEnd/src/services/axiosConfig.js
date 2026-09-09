import axios from 'axios';
import { authService } from './authService';

axios.defaults.withCredentials = true;


// Các request lỗi 401 dùng chung một lần làm mới token.
let isRefreshing = false;
let pendingQueue = [];
let installed = false;

const processQueue = (error, newToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  pendingQueue = [];
};

const forceLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('csrfToken');
  sessionStorage.removeItem('csrfToken');
  window.dispatchEvent(new Event('userUpdated'));

  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/admin/login') {
    window.location.href = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
  }
};

// Không tự refresh các endpoint xác thực để tránh gọi lặp.
const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/refresh-token') ||
  url.includes('/auth/logout');

export const setupAxiosInterceptors = () => {
  if (installed) return;
  installed = true;
  const api = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', window.location.origin);
  const isOwnApi = (config) => {
    try {
      const target = new URL(axios.getUri(config), window.location.origin);
      return target.origin === api.origin && (target.pathname === api.pathname || target.pathname.startsWith(`${api.pathname.replace(/\/$/, '')}/`));
    } catch { return false; }
  };
  axios.interceptors.request.use((config) => {
    if (isOwnApi(config)) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers ||= {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { response, config: originalRequest } = error;

      if (!response || !originalRequest || !isOwnApi(originalRequest)) return Promise.reject(error);

      const status = response.status;

      // Chỉ refresh khi lỗi 401; lỗi 403 không làm mất phiên.
      if (
        status !== 401 ||
        originalRequest._retry ||
        isAuthEndpoint(originalRequest.url)
      ) {
        return Promise.reject(error);
      }

      if (!localStorage.getItem('csrfToken') && !sessionStorage.getItem('csrfToken')) {
        forceLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const newToken = await authService.refreshToken(originalRequest.headers.Authorization?.replace(/^Bearer /, ''));
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        const failedToken = originalRequest.headers.Authorization?.replace(/^Bearer /, '');
        if (refreshError.response?.status === 401 && localStorage.getItem('token') === failedToken) forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
