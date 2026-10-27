// src/shared/context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react'; // Bug 4 fixed: bỏ useEffect không dùng
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

  // Mock login nhanh theo vai trò cho mục đích test
  const mockLogin = (role) => {
    const users = MockDB.getUsers();
    let target = users.find((u) => u.role === role && u.is_active);
    if (!target) {
      // Dự phòng nếu db rỗng
      const fallback = {
        ADMIN: { id: 1, full_name: 'Trưởng Ban Quản Lý', role: 'ADMIN', phone_number: '0901000001' },
        RESIDENT: { id: 3, full_name: 'Hồ Anh Dũng', role: 'RESIDENT', phone_number: '0903000001' },
        TECHNICIAN: { id: 2, full_name: 'Nguyễn Văn Thợ (Điện Nước)', role: 'TECHNICIAN', phone_number: '0902000001' },
      };
      target = fallback[role];
    }

    const authUser = {
      id: target.id,
      full_name: target.full_name,
      phone_number: target.phone_number,
      email: target.email,
      role: target.role,
      token: `mock-jwt-token-${target.role.toLowerCase()}-${target.id}`,
    };

    setUser(authUser);
    localStorage.setItem('user', JSON.stringify(authUser));
    return authUser;
  };

  // Đăng nhập thật bằng số điện thoại hoặc email (UC-01)
  const login = async (username, password) => {
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

    // Bug 2 fixed: so khớp đúng với mật khẩu lưu trong MockDB, không có backdoor '123456'
    const isPasswordCorrect = found.password === password;
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

  // Đổi mật khẩu cá nhân (UC-02)
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, message: 'Chưa đăng nhập' };

    const users = MockDB.getUsers();
    const userIndex = users.findIndex((u) => u.id === user.id);
    if (userIndex === -1) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    const targetUser = users[userIndex];

    // Bug 2 fixed: so khớp đúng với mật khẩu hiện tại, không có backdoor
    if (targetUser.password !== currentPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác' };
    }

    users[userIndex].password = newPassword;
    MockDB.saveUsers(users);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedApartmentId');
  };

  return (
    <AuthContext.Provider value={{ user, mockLogin, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
