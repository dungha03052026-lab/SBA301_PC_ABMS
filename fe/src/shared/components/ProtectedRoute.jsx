// src/shared/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
