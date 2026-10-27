// src/modules/resident/ResidentAnnouncements.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const ResidentAnnouncements = () => {
  return (
    <Card>
      <Title level={4}>📢 Bảng tin Thông báo Tòa nhà (UC-20)</Title>
      <Paragraph type="secondary">
        Cập nhật các thông báo quan trọng từ Ban Quản Lý (ưu tiên hiển thị các thông báo được ghim).
      </Paragraph>
    </Card>
  );
};

export default ResidentAnnouncements;
