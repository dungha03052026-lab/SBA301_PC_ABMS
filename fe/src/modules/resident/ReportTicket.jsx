// src/modules/resident/ReportTicket.jsx
import React from 'react';
import { Card, Typography } from 'antd';
import { useApartment } from '../../shared/context/ApartmentContext';

const { Title, Paragraph } = Typography;

const ReportTicket = () => {
  const { selectedApartment } = useApartment();

  return (
    <Card>
      <Title level={4}>
        🛠️ Báo hỏng Sự cố Căn hộ {selectedApartment?.room_number || ''} (UC-13, UC-17)
      </Title>
      <Paragraph type="secondary">
        Tạo yêu cầu sửa chữa, theo dõi tiến độ xử lý và nghiệm thu chấm 1-5 sao sau khi thợ sửa xong.
      </Paragraph>
    </Card>
  );
};

export default ReportTicket;
