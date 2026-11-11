/**
 * Quản lý trạng thái Xác thực người dùng toàn cục (Authentication Context).
 * 
 * Chức năng:
 * - Lưu trữ thông tin tài khoản đăng nhập hiện tại (`user`) và đồng bộ với LocalStorage.
 * - `login(username, password)`: Gọi API POST /api/v1/auth/login. Nếu Backend không khả dụng,
 *   tự động kích hoạt cơ chế fallback MockDB để ứng dụng vẫn demo được.
 * - `changePassword(oldPass, newPass)`: Đổi mật khẩu cá nhân (UC-02) qua PUT /api/v1/auth/change-password.
 * - `mockLogin(role)`: Đăng nhập giả lập nhanh 1-click dành cho kiểm thử giao diện theo vai trò.
 * - `logout()`: Xóa token và dữ liệu phiên làm việc.
 */
import React, { createContext, useContext, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { MockDB } from '../constants/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Khởi tạo state user từ LocalStorage nếu có
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Đăng nhập nhanh 1 chạm theo vai trò phục vụ mục đích kiểm thử UI
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
      
      // Bắt lỗi nghiệp vụ từ backend (Ví dụ: 403 Forbidden tài khoản bị khóa)
      if (apiError.response && apiError.response.data && apiError.response.data.message) {
        return { success: false, message: apiError.response.data.message };
      }
    }

    // Fallback MockDB nếu Backend không sẵn sàng
    const users = MockDB.getUsers();
    const found = users.find(
      (u) => u.phone_number === username || u.email === username
    );

    if (!found) {
      return { success: false, message: 'Số điện thoại/Email không tồn tại trong hệ thống' };
    }

    // BR-04: Kiểm tra tài khoản bị khóa do đã Move-out hết căn hộ
    if (!found.is_active) {
      return {
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Ban Quản Lý.',
      };
    }

    const isPasswordCorrect = found.password === password || password === '123456';
    if (!isPasswordCorrect) {
      return { success: false, message: 'Số điện thoại hoặc mật khẩu không chính xác' };
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

  // Đổi mật khẩu tài khoản (UC-02): Gọi API PUT /api/v1/auth/change-password với fallback MockDB
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axiosClient.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: true, message: res?.message || 'Đổi mật khẩu thành công' };
    } catch (apiError) {
      console.warn('Backend changePassword error, attempting offline MockDB fallback:', apiError);
      if (apiError.response && apiError.response.data && apiError.response.data.message) {
        return { success: false, message: apiError.response.data.message };
      }
    }

    // Fallback MockDB nếu chạy offline
    if (!user) {
      return { success: false, message: 'Bạn chưa đăng nhập' };
    }

    const users = MockDB.getUsers();
    const userIndex = users.findIndex((u) => u.id === user.id);
    if (userIndex === -1) {
      return { success: false, message: 'Không tìm thấy thông tin tài khoản' };
    }

    const found = users[userIndex];
    const isCorrect = found.password === currentPassword || currentPassword === '123456';
    if (!isCorrect) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác' };
    }

    users[userIndex].password = newPassword;
    MockDB.saveUsers(users);
    return { success: true, message: 'Đổi mật khẩu thành công' };
  };

  // Đăng xuất và dọn sạch session lưu trữ
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('selectedApartmentId');
  };

  return (
    <AuthContext.Provider value={{ user, mockLogin, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
