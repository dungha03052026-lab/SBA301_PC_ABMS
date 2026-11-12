/**
 * Điểm khởi nhập (Entry Point) của ứng dụng Frontend ABMS.
 * 
 * - Nạp stylesheet CSS: Bootstrap 5 & Custom Global Styles.
 * - Khởi tạo MockDB (LocalStorage) phục vụ chế độ offline fallback nếu Backend không kết nối được.
 * - Render cây component React vào phần tử DOM gốc '#root'.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { initMockStorage, IS_MOCK_FALLBACK_ENABLED } from './shared/constants/mockData';

// Khởi tạo dữ liệu MockDB một lần duy nhất khi bật chế độ offline fallback
if (IS_MOCK_FALLBACK_ENABLED) {
  initMockStorage();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
