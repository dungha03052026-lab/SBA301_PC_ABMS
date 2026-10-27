// src/modules/resident/MyInvoices.jsx
import React from 'react';
import { Card, Typography } from 'antd';
import { useApartment } from '../../shared/context/ApartmentContext';

const { Title, Paragraph } = Typography;

const MyInvoices = () => {
  const { selectedApartment } = useApartment();

  return (
    <Card>
      <Title level={4}>
        💳 Hóa đơn Căn hộ {selectedApartment?.room_number || ''} (UC-10, UC-11)
      </Title>
      <Paragraph type="secondary">
        Xem danh sách hóa đơn theo căn hộ đang chọn, quét mã VietQR và bấm xác nhận chuyển khoản.
      </Paragraph>
    </Card>
  );
};

export default MyInvoices;
