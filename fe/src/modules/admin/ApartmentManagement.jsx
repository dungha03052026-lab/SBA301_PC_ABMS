// src/modules/admin/ApartmentManagement.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const ApartmentManagement = () => {
  return (
    <div>
      <h2
        className="ps-heading-xl"
        style={{
          fontWeight: 300, // Signature PlayStation weight 300
          color: PS_COLORS.ink,
          marginBottom: 12,
        }}
      >
        Quản lý Căn hộ, Cư dân & Phương tiện
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Đặc tả nghiệp vụ UC-04, UC-05, UC-06 (Move-out chặn nợ) và UC-07 (Phương tiện xe).
      </p>
    </div>
  );
};

export default ApartmentManagement;
