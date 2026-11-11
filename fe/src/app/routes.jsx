/**
 * Quản lý định tuyến tập trung của hệ thống ABMS (Centralized Routing).
 * 
 * Cấu trúc phân quyền & bảo vệ tuyến đường (ProtectedRoute):
 * 1. /login: Trang đăng nhập chung cho cả 3 vai trò (ADMIN, RESIDENT, TECHNICIAN).
 * 2. /admin/**: Phân hệ Quản trị viên (Ban Quản Lý):
 *    - apartments: Quản lý căn hộ, cư dân, phương tiện, Move-in/Move-out.
 *    - meter-reading: Ghi chỉ số điện nước & chốt số hóa đơn.
 *    - invoices: Đối soát và phê duyệt thanh toán hóa đơn (BR-06).
 *    - tickets: Giám sát toàn bộ sự cố và phân công kỹ thuật viên.
 *    - announcements: Soạn thảo và quản lý thông báo tòa nhà.
 * 3. /resident/**: Phân hệ Cư dân:
 *    - invoices: Xem lịch sử hóa đơn & gửi xác nhận đã chuyển khoản.
 *    - tickets: Báo hỏng kỹ thuật & nghiệm thu đánh giá kết quả sửa chữa.
 *    - announcements: Xem bảng tin tòa nhà.
 * 4. /technician/**: Phân hệ Kỹ thuật viên:
 *    - task-pool: Chợ việc chung - nhận việc (Claim) từ danh sách OPEN.
 *    - my-tasks: Danh sách việc đang nhận xử lý & báo hoàn thành.
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { ApartmentProvider } from '../shared/context/ApartmentContext';
import ProtectedRoute from '../shared/components/ProtectedRoute';

// Layouts theo vai trò
import AdminLayout from '../shared/layouts/AdminLayout';
import ResidentLayout from '../shared/layouts/ResidentLayout';
import TechLayout from '../shared/layouts/TechLayout';

// Auth Pages
import LoginPage from '../modules/auth/LoginPage';

// Admin Pages
import ApartmentManagement from '../modules/admin/ApartmentManagement';
import MeterReading from '../modules/admin/MeterReading';
import InvoiceApproval from '../modules/admin/InvoiceApproval';
import TicketManagement from '../modules/admin/TicketManagement';
import Announcements from '../modules/admin/Announcements';

// Resident Pages
import MyInvoices from '../modules/resident/MyInvoices';
import ReportTicket from '../modules/resident/ReportTicket';
import ResidentAnnouncements from '../modules/resident/ResidentAnnouncements';

// Technician Pages
import TaskPool from '../modules/technician/TaskPool';
import MyTasks from '../modules/technician/MyTasks';

const AppRoutes = () => {
  return (
    <AuthProvider>
      <ApartmentProvider>
        <BrowserRouter>
          <Routes>
            {/* Tuyến đường công khai (Public Route) */}
            <Route path="/login" element={<LoginPage />} />

            {/* Phân hệ ADMIN (Yêu cầu vai trò ADMIN) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="apartments" replace />} />
              <Route path="apartments" element={<ApartmentManagement />} />
              <Route path="meter-reading" element={<MeterReading />} />
              <Route path="invoices" element={<InvoiceApproval />} />
              <Route path="tickets" element={<TicketManagement />} />
              <Route path="announcements" element={<Announcements />} />
            </Route>

            {/* Phân hệ RESIDENT (Yêu cầu vai trò RESIDENT) */}
            <Route
              path="/resident"
              element={
                <ProtectedRoute allowedRoles={['RESIDENT']}>
                  <ResidentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="invoices" replace />} />
              <Route path="invoices" element={<MyInvoices />} />
              <Route path="tickets" element={<ReportTicket />} />
              <Route path="announcements" element={<ResidentAnnouncements />} />
            </Route>

            {/* Phân hệ TECHNICIAN (Yêu cầu vai trò TECHNICIAN) */}
            <Route
              path="/technician"
              element={
                <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                  <TechLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="task-pool" replace />} />
              <Route path="task-pool" element={<TaskPool />} />
              <Route path="my-tasks" element={<MyTasks />} />
            </Route>

            {/* Tuyến đường mặc định khi sai URL */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ApartmentProvider>
    </AuthProvider>
  );
};

export default AppRoutes;
