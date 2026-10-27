// src/modules/technician/MyTasks.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const MyTasks = () => {
  return (
    <Card>
      <Title level={4}>🔧 Việc của tôi (IN_PROGRESS) (UC-16)</Title>
      <Paragraph type="secondary">
        Danh sách công việc kỹ thuật viên đã tiếp nhận. Cập nhật biên bản xử lý và báo hoàn thành (RESOLVED).
      </Paragraph>
    </Card>
  );
};

export default MyTasks;
