/**
 * Component gốc (Root Component) của ứng dụng ABMS.
 * 
 * - Áp dụng cấu hình chủ đề PlayStation Theme cho thư viện Ant Design (Antd ConfigProvider).
 * - Tích hợp hệ thống điều hướng và định tuyến AppRoutes.
 */
import React from 'react';
import { ConfigProvider } from 'antd';
import AppRoutes from './app/routes';
import { playstationAntdTheme } from './shared/theme/playstationTheme';

function App() {
  return (
    <ConfigProvider theme={playstationAntdTheme}>
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;
