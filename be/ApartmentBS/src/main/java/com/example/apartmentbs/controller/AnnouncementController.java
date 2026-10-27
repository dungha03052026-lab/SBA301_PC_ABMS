package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.AnnouncementRequest;
import com.example.apartmentbs.dto.response.AnnouncementResponse;
import com.example.apartmentbs.dto.response.ApiResponse;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.service.AnnouncementService;
import com.example.apartmentbs.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final AuthService authService;

    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements() {
        List<AnnouncementResponse> list = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncementById(@PathVariable Long id) {
        AnnouncementResponse response = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request
    ) {
        User admin = authService.getAuthenticatedUser();
        AnnouncementResponse response = announcementService.createAnnouncement(request, admin.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đăng thông báo thành công", response));
    }

    @PutMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request
    ) {
        AnnouncementResponse response = announcementService.updateAnnouncement(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông báo thành công", response));
    }

    @DeleteMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa thông báo thành công", null));
    }
}
