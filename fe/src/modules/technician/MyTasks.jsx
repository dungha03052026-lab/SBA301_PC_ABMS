// src/modules/technician/MyTasks.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const MyTasks = () => {
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
        Việc của tôi — Đang tiếp nhận xử lý
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Danh sách sự cố IN_PROGRESS. Nhập biên bản kỹ thuật technician_note và báo hoàn thành RESOLVED (UC-16).
      </p>
    </div>
  );
};

export default MyTasks;
