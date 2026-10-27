// src/shared/constants/mockData.js
// Nguồn dữ liệu giả lập 7 bảng chuẩn hóa MSSQL đồng bộ qua LocalStorage

const STORAGE_KEYS = {
  USERS: 'bms_users',
  APARTMENTS: 'bms_apartments',
  VEHICLES: 'bms_vehicles',
  TARIFFS: 'bms_tariffs',
  INVOICES: 'bms_invoices',
  TICKETS: 'bms_tickets',
  ANNOUNCEMENTS: 'bms_announcements',
};

// Dữ liệu ban đầu thỏa mãn đầy đủ các kịch bản kiểm thử (Test Scenarios)
const INITIAL_DATA = {
  users: [
    {
      id: 1,
      phone_number: '0901000001',
      email: 'admin@building.vn',
      password: 'password123',
      full_name: 'Trưởng Ban Quản Lý',
      role: 'ADMIN',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 2,
      phone_number: '0902000001',
      email: 'tech1@building.vn',
      password: 'password123',
      full_name: 'Nguyễn Văn Thợ (Điện Nước)',
      role: 'TECHNICIAN',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 3,
      phone_number: '0903000001',
      email: 'resident.dung@gmail.com',
      password: 'password123',
      full_name: 'Hồ Anh Dũng',
      role: 'RESIDENT',
      is_active: true,
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
  ],
  apartments: [
    {
      id: 1,
      room_number: 'A-101',
      floor: 1,
      building_block: 'Tòa A',
      area_sqm: 75.5,
      status: 'OCCUPIED',
      resident_id: 3, // Căn 1 của Hồ Anh Dũng
      updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 2,
      room_number: 'B-502',
      floor: 5,
      building_block: 'Tòa B',
      area_sqm: 68.0,
      status: 'OCCUPIED',
      resident_id: 3, // Căn 2 của Hồ Anh Dũng (Kiểm thử Switch Context UC-03)
      updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 3,
      room_number: 'A-102',
      floor: 1,
      building_block: 'Tòa A',
      area_sqm: 75.5,
      status: 'VACANT', // Căn trống để test Move-in UC-05
      resident_id: null,
      updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
  ],
  vehicles: [
    {
      id: 1,
      apartment_id: 1,
      license_plate: '30A-999.88',
      vehicle_type: 'CAR',
      owner_name: 'Hồ Anh Dũng',
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 2,
      apartment_id: 1,
      license_plate: '29X1-123.45',
      vehicle_type: 'MOTORBIKE',
      owner_name: 'Hồ Anh Dũng',
      created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
  ],
  tariffs: {
    id: 1,
    management_fee_per_sqm: 10000.0,
    electricity_unit_price: 3500.0,
    water_unit_price: 15000.0,
    motorbike_fee: 100000.0,
    car_fee: 1200000.0,
    updated_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  invoices: [
    {
      id: 1,
      invoice_code: 'INV-202610-A101',
      apartment_id: 1,
      billing_month: '2026-10',
      old_electric_num: 100,
      new_electric_num: 180,
      old_water_num: 20,
      new_water_num: 28,
      total_amount: 2455000.0, // Điện: 80*3500=280k + Nước: 8*15000=120k + Phí QL: 75.5*10000=755k + Xe: 1CAR*1200k+1MOTORBIKE*100k=1300k → Tổng: 2.455.000 VNĐ
      status: 'UNPAID', // Test chặn Move-out và Quét VietQR
      due_date: '2026-10-25',
      paid_at: null,
      approved_by: null,
      created_at: new Date('2026-10-01T00:00:00Z').toISOString(),
    },
    {
      id: 2,
      invoice_code: 'INV-202609-A101',
      apartment_id: 1,
      billing_month: '2026-09',
      old_electric_num: 30,
      new_electric_num: 100,
      old_water_num: 10,
      new_water_num: 20,
      total_amount: 2200000.0,
      status: 'PENDING', // Test màn hình đối soát sao kê Admin UC-12
      due_date: '2026-09-25',
      paid_at: null,
      approved_by: null,
      created_at: new Date('2026-09-01T00:00:00Z').toISOString(),
    },
  ],
  tickets: [
    {
      id: 1,
      ticket_code: 'TCK-202610-001',
      apartment_id: 1,
      resident_id: 3,
      category: 'PLUMBING',
      title: 'Rò rỉ nước bồn rửa bát',
      description: 'Ống xả dưới bồn rửa bị nứt, rỉ nước ra sàn bếp',
      image_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500',
      status: 'OPEN', // Quá 24h để test huy hiệu cảnh báo đỏ [QUÁ HẠN > 24H]
      assigned_to: null,
      technician_note: null,
      rating: null,
      created_at: new Date(Date.now() - 32 * 60 * 60 * 1000).toISOString(), // Tạo cách đây 32 tiếng
      resolved_at: null,
    },
    {
      id: 2,
      ticket_code: 'TCK-202610-002',
      apartment_id: 1,
      resident_id: 3,
      category: 'ELECTRIC',
      title: 'Chập aptomat ổ cắm phòng khách',
      description: 'Cắm ấm siêu tốc bị nổ lách tách và nhảy aptomat',
      image_url: '',
      status: 'RESOLVED', // Test cư dân chấm 1-5 sao nghiệm thu UC-17
      assigned_to: 2,
      technician_note: 'Đã thay mới aptomat 20A và siết chặt đầu cosse nguồn',
      rating: null,
      created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  announcements: [
    {
      id: 1,
      title: 'Thông báo lịch bảo trì thang máy Tòa A',
      content: 'Ban quản lý xin thông báo tạm dừng thang máy số 2 Tòa A từ 13h-17h ngày Chủ nhật để bảo dưỡng định kỳ.',
      created_by: 1,
      is_pinned: true, // Test hiển thị ưu tiên ghim
      created_at: new Date('2026-10-20T08:00:00Z').toISOString(),
    },
    {
      id: 2,
      title: 'Lịch phun thuốc diệt côn trùng định kỳ',
      content: 'BQL sẽ tiến hành phun thuốc diệt muỗi khu vực hành lang và tầng hầm vào tối thứ 6 tuần này.',
      created_by: 1,
      is_pinned: false,
      created_at: new Date('2026-10-18T09:30:00Z').toISOString(),
    },
  ],
};

// Hàm khởi tạo LocalStorage nếu chưa có
export const initMockStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APARTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APARTMENTS, JSON.stringify(INITIAL_DATA.apartments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_DATA.vehicles));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TARIFFS)) {
    localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(INITIAL_DATA.tariffs));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_DATA.invoices));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_DATA.tickets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_DATA.announcements));
  }
};

// Đảm bảo khởi tạo ngay khi file được nạp
initMockStorage();

// Các hàm Helper truy xuất và lưu dữ liệu
const getList = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return [];
  }
};

const setList = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

export const MockDB = {
  // Users
  getUsers: () => getList(STORAGE_KEYS.USERS),
  saveUsers: (data) => setList(STORAGE_KEYS.USERS, data),

  // Apartments
  getApartments: () => getList(STORAGE_KEYS.APARTMENTS),
  saveApartments: (data) => setList(STORAGE_KEYS.APARTMENTS, data),

  // Vehicles
  getVehicles: () => getList(STORAGE_KEYS.VEHICLES),
  saveVehicles: (data) => setList(STORAGE_KEYS.VEHICLES, data),

  // Tariffs
  getTariffs: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TARIFFS);
      return data ? JSON.parse(data) : INITIAL_DATA.tariffs;
    } catch {
      return INITIAL_DATA.tariffs;
    }
  },
  saveTariffs: (data) => {
    localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(data));
  },

  // Invoices
  getInvoices: () => getList(STORAGE_KEYS.INVOICES),
  saveInvoices: (data) => setList(STORAGE_KEYS.INVOICES, data),

  // Tickets
  getTickets: () => getList(STORAGE_KEYS.TICKETS),
  saveTickets: (data) => setList(STORAGE_KEYS.TICKETS, data),

  // Announcements
  getAnnouncements: () => getList(STORAGE_KEYS.ANNOUNCEMENTS),
  saveAnnouncements: (data) => setList(STORAGE_KEYS.ANNOUNCEMENTS, data),

  // Reset to initial
  resetAll: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
    localStorage.setItem(STORAGE_KEYS.APARTMENTS, JSON.stringify(INITIAL_DATA.apartments));
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_DATA.vehicles));
    localStorage.setItem(STORAGE_KEYS.TARIFFS, JSON.stringify(INITIAL_DATA.tariffs));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_DATA.invoices));
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_DATA.tickets));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(INITIAL_DATA.announcements));
  },
};
