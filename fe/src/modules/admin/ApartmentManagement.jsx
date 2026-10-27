// src/modules/admin/ApartmentManagement.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ApartmentManagement = () => {
  return (
    <Card>
      <Title level={4}>🏢 Quản lý Căn hộ, Cư dân & Phương tiện (UC-04, UC-05, UC-06, UC-07)</Title>
      <Paragraph type="secondary">
        Chức năng đang được chuẩn bị triển khai ở Giai đoạn 1.
      </Paragraph>
    </Card>
  );
};

export default ApartmentManagement;
