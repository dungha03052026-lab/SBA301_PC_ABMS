/**
 * Cấu hình HTTP Client tập trung (Axios Instance) cho toàn bộ ứng dụng Frontend.
 * 
 * Tính năng chính:
 * 1. Base URL: Lấy từ biến môi trường VITE_API_BASE_URL hoặc mặc định 'http://localhost:8080/api/v1'.
 * 2. Request Interceptor: Tự động trích xuất Bearer token từ localStorage('user') và gắn vào Header 'Authorization'.
 * 3. Response Interceptor: 
 *    - Tự động bóc tách và trả về `response.data` cho các hàm gọi API.
 *    - Bắt lỗi HTTP 401 Unauthorized: Xóa phiên làm việc và tự động điều hướng người dùng về màn hình đăng nhập /login.
 */
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Interceptor cho Request: Tự động đính kèm Bearer Token
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.error('Error attaching auth token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho Response: Xử lý response hoặc bắt lỗi 401 (Hết hạn phiên)
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data từ server
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hết hạn phiên đăng nhập -> Dọn dẹp session và chuyển về login
      localStorage.removeItem('user');
      localStorage.removeItem('selectedApartmentId');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getBackendErrorMessage = (err, fallback) =>
  err?.response?.data?.message || fallback;

export default axiosClient;
