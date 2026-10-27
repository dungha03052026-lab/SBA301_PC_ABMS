// src/modules/admin/Announcements.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Announcements = () => {
  return (
    <Card>
      <Title level={4}>📢 Quản lý Bản tin Thông báo Tòa nhà (UC-19)</Title>
      <Paragraph type="secondary">
        Chức năng đăng, sửa, ghim thông báo quan trọng lên đầu cho cư dân.
      </Paragraph>
    </Card>
  );
};

export default Announcements;
