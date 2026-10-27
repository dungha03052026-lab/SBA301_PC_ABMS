// src/modules/admin/TicketManagement.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const TicketManagement = () => {
  return (
    <Card>
      <Title level={4}>🛠️ Giám sát Sự cố Tòa nhà & Chỉ định Thợ quá 24h (UC-18)</Title>
      <Paragraph type="secondary">
        Chức năng theo dõi toàn bộ ticket và can thiệp gán cưỡng bức cho thợ khi tồn đọng quá 24h.
      </Paragraph>
    </Card>
  );
};

export default TicketManagement;
