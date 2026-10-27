// src/modules/admin/Announcements.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const Announcements = () => {
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
        Quản lý Bản tin Thông báo Tòa nhà
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Đăng, ghim thông báo quan trọng lên đầu và gỡ bỏ các bản tin cũ (UC-19).
      </p>
    </div>
  );
};

export default Announcements;
