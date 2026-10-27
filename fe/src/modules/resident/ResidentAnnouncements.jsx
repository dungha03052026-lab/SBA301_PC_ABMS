// src/modules/resident/ResidentAnnouncements.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const ResidentAnnouncements = () => {
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
        Bản tin Thông báo Tòa nhà
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Thông báo chính thức từ Ban Quản Lý (các thông báo được ghim hiển thị ưu tiên hàng đầu) (UC-20).
      </p>
    </div>
  );
};

export default ResidentAnnouncements;
