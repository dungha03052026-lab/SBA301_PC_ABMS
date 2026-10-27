// src/modules/admin/MeterReading.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const MeterReading = () => {
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
        Chốt số Điện Nước & Lập Hóa đơn Hàng tháng
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Cấu hình đơn giá dịch vụ (UC-08) và chốt số điện nước tự động tính tiền BR-05 (UC-09).
      </p>
    </div>
  );
};

export default MeterReading;
