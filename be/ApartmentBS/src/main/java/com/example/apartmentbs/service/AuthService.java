package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.LoginRequest;
import com.example.apartmentbs.dto.response.AuthResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.model.User;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser();
    User getAuthenticatedUser();
}
