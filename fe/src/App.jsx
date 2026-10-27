// src/App.jsx
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
