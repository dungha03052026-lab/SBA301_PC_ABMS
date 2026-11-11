package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.ChangePasswordRequest;
import com.example.apartmentbs.dto.request.LoginRequest;
import com.example.apartmentbs.dto.response.ApiResponse;
import com.example.apartmentbs.dto.response.AuthResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các tác vụ xác thực người dùng (Authentication & Account Management).
 * 
 * Cung cấp các endpoint:
 * - POST /api/v1/auth/login: Đăng nhập bằng số điện thoại và mật khẩu, trả về JWT Token.
 * - GET  /api/v1/auth/me: Lấy thông tin tài khoản người dùng đang đăng nhập.
 * - PUT  /api/v1/auth/change-password: Đổi mật khẩu cá nhân (UC-02).
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng nhập vào hệ thống ABMS.
     * Kiểm tra số điện thoại, mật khẩu, và trạng thái kích hoạt của tài khoản.
     *
     * @param request Chứa số điện thoại và mật khẩu
     * @return AuthResponse kèm JWT Bearer Token và thông tin cơ bản của User
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    /**
     * Lấy thông tin chi tiết của người dùng hiện tại từ Security Context (dựa trên JWT gửi lên).
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Đổi mật khẩu cho tài khoản người dùng hiện tại (UC-02).
     *
     * @param request Mật khẩu hiện tại và mật khẩu mới
     */
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = authService.getAuthenticatedUser();
        authService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }
}
