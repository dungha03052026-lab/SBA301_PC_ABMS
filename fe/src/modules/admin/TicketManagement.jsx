// src/modules/admin/TicketManagement.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const TicketManagement = () => {
  return (
    <div>
      <h2
        className="ps-heading-xl"
        style={{
          fontWeight: 300,
          color: PS_COLORS.ink,
          marginBottom: 12,
        }}
      >
        Giám sát Sự cố Tòa nhà & Chỉ định Thợ
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Theo dõi toàn bộ ticket của tòa nhà và điều phối cưỡng bức các sự cố quá hạn 24 giờ (UC-18).
      </p>
    </div>
  );
};

export default TicketManagement;
