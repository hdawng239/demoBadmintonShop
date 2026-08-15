import axios from 'axios';
import { authService } from './authService';

// Thiết lập axios toàn cục: tự động làm mới access token khi hết hạn (401),
// và đăng xuất khi refresh thất bại hoặc bị cấm quyền (403).

// ── Single-flight: nhiều request 401 cùng lúc chỉ refresh 1 lần ──
let isRefreshing = false;
let pendingQueue = []; // các request đang chờ token mới

const processQueue = (error, newToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newToken);
  });
  pendingQueue = [];
};

// Đăng xuất "cứng": xóa token và điều hướng về trang login phù hợp.
const forceLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('userUpdated'));

  const currentPath = window.location.pathname;
  if (currentPath !== '/login' && currentPath !== '/admin/login') {
    window.location.href = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
  }
};

// Các endpoint không được phép refresh (tránh đệ quy vô hạn).
const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') ||
  url.includes('/auth/refresh-token') ||
  url.includes('/auth/logout');

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { response, config: originalRequest } = error;

      // Không có response (lỗi mạng) hoặc không có config -> trả lỗi nguyên trạng.
      if (!response || !originalRequest) return Promise.reject(error);

      const status = response.status;

      // 403 = sai quyền hoặc token hỏng -> không cứu được, đăng xuất luôn.
      if (status === 403) {
        forceLogout();
        return Promise.reject(error);
      }

      // Chỉ xử lý 401 (token hết hạn), và chưa từng retry, và không phải endpoint auth.
      if (
        status !== 401 ||
        originalRequest._retry ||
        isAuthEndpoint(originalRequest.url)
      ) {
        // 401 ở các endpoint auth (vd refresh hết hạn) -> đăng xuất.
        if (status === 401 && isAuthEndpoint(originalRequest.url)) {
          forceLogout();
        }
        return Promise.reject(error);
      }

      // Không có refresh token -> không thể làm mới.
      if (!localStorage.getItem('refreshToken')) {
        forceLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // Nếu đang refresh, xếp hàng chờ token mới rồi retry.
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

      // Tiến hành refresh (single-flight).
      isRefreshing = true;
      try {
        const newToken = await authService.refreshToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        forceLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
  );
};
