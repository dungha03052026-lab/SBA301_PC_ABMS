// src/modules/admin/InvoiceApproval.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const InvoiceApproval = () => {
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
        Đối soát Sao kê & Gạch nợ Thủ công (Plan B)
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Kiểm tra biến động số dư và duyệt hoặc từ chối các hóa đơn PENDING (UC-12).
      </p>
    </div>
  );
};

export default InvoiceApproval;
