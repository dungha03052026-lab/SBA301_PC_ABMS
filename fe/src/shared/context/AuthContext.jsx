// src/shared/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { MockDB } from '../constants/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Mock login nhanh theo vai trò cho mục đích test UI
  const mockLogin = (role) => {
    const users = MockDB.getUsers();
    let target = users.find((u) => u.role === role && u.is_active);
    if (!target) {
      const fallback = {
        ADMIN: { id: 1, full_name: 'Trưởng Ban Quản Lý', role: 'ADMIN', phone_number: '0901000001', email: 'admin@building.vn' },
        RESIDENT: { id: 3, full_name: 'Hồ Anh Dũng', role: 'RESIDENT', phone_number: '0903000001', email: 'resident.dung@gmail.com' },
        TECHNICIAN: { id: 2, full_name: 'Nguyễn Văn Thợ (Điện Nước)', role: 'TECHNICIAN', phone_number: '0902000001', email: 'tech1@building.vn' },
      };
      target = fallback[role];
    }

    const authUser = {
      id: target.id,
      full_name: target.full_name || target.fullName,
      phone_number: target.phone_number || target.phoneNumber,
      email: target.email,
      role: target.role,
      token: `mock-jwt-token-${target.role.toLowerCase()}-${target.id}`,
    };

    setUser(authUser);
    localStorage.setItem('user', JSON.stringify(authUser));
    return authUser;
  };

  // Đăng nhập kết nối REST API Backend (Spring Boot /api/v1/auth/login)
  const login = async (username, password) => {
    try {
      const res = await axiosClient.post('/auth/login', {
        phoneNumber: username.trim(),
        password: password,
      });

      if (res && res.success && res.data) {
        const { token, user: userData } = res.data;
        const authUser = {
          id: userData.id,
          full_name: userData.fullName,
          phone_number: userData.phoneNumber,
          email: userData.email,
          role: userData.role,
          token: token,
        };

        setUser(authUser);
        localStorage.setItem('user', JSON.stringify(authUser));
        return { success: true, user: authUser };
      }
    } catch (apiError) {
      console.warn('Backend login error, attempting offline MockDB fallback:', apiError);
      
      // Fallback sang MockDB nếu Backend không sẵn sàng hoặc thông báo lỗi từ server
      if (apiError.response && apiError.response.data && apiError.response.data.message) {
        return { success: false, message: apiError.response.data.message };
      }
    }

    // Fallback MockDB
    const users = MockDB.getUsers();
    const found = users.find(
      (u) => u.phone_number === username || u.email === username
    );

    if (!found) {
      return { success: false, message: 'Số điện thoại/Email không tồn tại trong hệ thống' };
    }

    if (!found.is_active) {
      return {
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa do cư dân đã làm thủ tục Move-out',
      };
    }

    const isPasswordCorrect = found.password === password || password === '123456';
    if (!isPasswordCorrect) {
      return { success: false, message: 'Mật khẩu không chính xác' };
    }

    const authUser = {
      id: found.id,
      full_name: found.full_name,
      phone_number: found.phone_number,
      email: found.email,
      role: found.role,
      token: `mock-jwt-token-${found.role.toLowerCase()}-${found.id}`,
    };

    setUser(authUser);
    localStorage.setItem('user', JSON.stringify(authUser));
    return { success: true, user: authUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedApartmentId');
  };

  return (
    <AuthContext.Provider value={{ user, mockLogin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
