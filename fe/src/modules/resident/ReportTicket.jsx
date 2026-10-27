// src/modules/resident/ReportTicket.jsx
import React from 'react';
import { useApartment } from '../../shared/context/ApartmentContext';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const ReportTicket = () => {
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
        Báo hỏng & Yêu cầu Kỹ thuật — {selectedApartment ? `${selectedApartment.room_number}` : ''}
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Tạo phiếu báo hỏng sự cố căn hộ, theo dõi tiến độ và nghiệm thu chấm 1–5 sao (UC-13, UC-17).
      </p>
    </div>
  );
};

export default ReportTicket;
