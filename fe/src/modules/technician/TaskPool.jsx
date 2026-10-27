// src/modules/technician/TaskPool.jsx
import React from 'react';
import { PS_COLORS } from '../../shared/theme/playstationTheme';

const TaskPool = () => {
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
        Chợ việc Kỹ thuật — Task Pool chung
      </h2>
      <p
        className="ps-body-md"
        style={{ color: PS_COLORS.bodyLight, marginBottom: 24 }}
      >
        Danh sách sự cố đang mở (OPEN) trong tòa nhà. Cơ chế nhận việc khóa nguyên tử và cờ đỏ cảnh báo quá hạn 24h (UC-14, UC-15).
      </p>
    </div>
  );
};

export default TaskPool;
