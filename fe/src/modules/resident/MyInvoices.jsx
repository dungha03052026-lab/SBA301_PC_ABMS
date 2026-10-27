// src/modules/resident/MyInvoices.jsx
import React from 'react';
import { useApartment } from '../../shared/context/ApartmentContext';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const MyInvoices = () => {
  const { selectedApartment } = useApartment();

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
        Hóa đơn Dịch vụ — {selectedApartment ? `${selectedApartment.room_number} (${selectedApartment.building_block})` : 'Chưa chọn căn hộ'}
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Xem danh sách hóa đơn theo kỳ, thanh toán VietQR động và xác nhận chuyển tiền (UC-10, UC-11).
      </p>
    </div>
  );
};

export default MyInvoices;
