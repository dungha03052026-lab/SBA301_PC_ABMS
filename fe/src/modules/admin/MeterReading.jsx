// src/modules/admin/MeterReading.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const MeterReading = () => {
  return (
    <Card>
      <Title level={4}>⚡ Chốt số Điện Nước & Xuất Hóa đơn (UC-08, UC-09)</Title>
      <Paragraph type="secondary">
        Chức năng cấu hình đơn giá và chốt số điện nước tự động tính tiền BR-05.
      </Paragraph>
    </Card>
  );
};

export default MeterReading;
