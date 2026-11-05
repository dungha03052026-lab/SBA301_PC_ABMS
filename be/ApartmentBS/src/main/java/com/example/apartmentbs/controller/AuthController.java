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

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = authService.getAuthenticatedUser();
        authService.changePassword(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }
}
