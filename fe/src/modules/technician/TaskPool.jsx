// src/modules/technician/TaskPool.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const TaskPool = () => {
  return (
    <Card>
      <Title level={4}>🛒 Chợ việc Kỹ thuật - Task Pool (UC-14, UC-15)</Title>
      <Paragraph type="secondary">
        Danh sách sự cố đang mở (OPEN) trong tòa nhà. Nhận biết sự cố quá hạn 24h và nhận việc theo cơ chế khóa nguyên tử.
      </Paragraph>
    </Card>
  );
};

export default TaskPool;
