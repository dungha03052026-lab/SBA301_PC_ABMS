package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.response.ApiResponse;
import com.example.apartmentbs.dto.response.ApartmentResponse;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.service.ApartmentService;
import com.example.apartmentbs.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resident")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RESIDENT')")
public class ResidentApartmentController {

    private final ApartmentService apartmentService;
    private final AuthService authService;

    @GetMapping("/apartments")
    public ResponseEntity<ApiResponse<List<ApartmentResponse>>> getMyApartments() {
        User user = authService.getAuthenticatedUser();
        List<ApartmentResponse> myApartments = apartmentService.getApartmentsByResident(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(myApartments));
    }
}
