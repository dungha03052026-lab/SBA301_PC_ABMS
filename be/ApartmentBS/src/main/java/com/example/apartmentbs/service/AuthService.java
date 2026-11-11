package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.ChangePasswordRequest;
import com.example.apartmentbs.dto.request.LoginRequest;
import com.example.apartmentbs.dto.response.AuthResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.model.User;

/**
 * Giao diện dịch vụ Xác thực và Quản lý tài khoản người dùng (Authentication Service).
 */
public interface AuthService {

    /**
     * Xác thực thông tin đăng nhập và tạo JWT token.
     *
     * @param request Thông tin đăng nhập (số điện thoại và mật khẩu)
     * @return AuthResponse chứa chuỗi Bearer token và thông tin user
     */
    AuthResponse login(LoginRequest request);

    /**
     * Lấy thông tin DTO của người dùng hiện tại đang đăng nhập.
     */
    UserResponse getCurrentUser();

    /**
     * Lấy đối tượng Entity User từ SecurityContextHolder của phiên làm việc hiện tại.
     */
    User getAuthenticatedUser();

    /**
     * Đổi mật khẩu tài khoản người dùng (UC-02).
     *
     * @param userId ID người dùng cần đổi mật khẩu
     * @param request Mật khẩu cũ và mật khẩu mới
     */
    void changePassword(Long userId, ChangePasswordRequest request);
}
