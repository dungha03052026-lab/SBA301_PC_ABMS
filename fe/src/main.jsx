import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { initMockStorage } from './shared/constants/mockData';

// Khởi tạo dữ liệu MockDB một lần duy nhất trước khi mount React tree
// Tường minh tại entry point, tránh side-effect ngầm trong module scope
initMockStorage();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);