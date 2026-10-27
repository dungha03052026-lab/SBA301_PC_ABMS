// src/shared/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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

// Interceptor cho Response: Xử lý response hoặc bắt lỗi 401
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data từ server
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hết hạn phiên đăng nhập
      localStorage.removeItem('user');
      localStorage.removeItem('selectedApartmentId');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
