// src/modules/admin/InvoiceApproval.jsx
import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

const InvoiceApproval = () => {
  return (
    <Card>
      <Title level={4}>💰 Đối soát Sao kê & Gạch nợ Thủ công - Plan B (UC-12)</Title>
      <Paragraph type="secondary">
        Chức năng duyệt hóa đơn PENDING sau khi cư dân quét VietQR chuyển khoản.
      </Paragraph>
    </Card>
  );
};

export default InvoiceApproval;
