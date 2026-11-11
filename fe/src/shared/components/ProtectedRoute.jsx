/**
 * Component bảo vệ tuyến đường theo trạng thái đăng nhập và vai trò người dùng (Route Guard / RBAC).
 * 
 * Luồng kiểm tra:
 * 1. Nếu chưa đăng nhập (user == null) -> Chuyển hướng về trang đăng nhập `/login`.
 * 2. Nếu đã đăng nhập nhưng vai trò không nằm trong `allowedRoles`:
 *    - Tự động điều hướng người dùng về trang chủ tương ứng của vai trò họ (ADMIN -> /admin/apartments,
 *      RESIDENT -> /resident/invoices, TECHNICIAN -> /technician/task-pool).
 * 3. Nếu quyền hợp lệ -> Render `children` hoặc `<Outlet />`.
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  // Kiểm tra chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra quyền hạn theo vai trò (Role-Based Access Control)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Điều hướng về trang mặc định theo vai trò nếu không có quyền truy cập
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/apartments" replace />;
    }
    if (user.role === 'RESIDENT') {
      return <Navigate to="/resident/invoices" replace />;
    }
    if (user.role === 'TECHNICIAN') {
      return <Navigate to="/technician/task-pool" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
