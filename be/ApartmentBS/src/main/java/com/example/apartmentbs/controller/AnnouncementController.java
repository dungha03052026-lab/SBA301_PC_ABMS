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

/**
 * REST Controller quản lý hệ thống Thông báo (Announcements) của tòa nhà.
 * 
 * - Cư dân và người dùng xem danh sách thông báo chung (ưu tiên các tin được ghim isPinned = true).
 * - Admin có quyền soạn thảo, ghim tin quan trọng, chỉnh sửa và xóa thông báo.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final AuthService authService;

    /**
     * Lấy toàn bộ danh sách thông báo tòa nhà (sắp xếp theo tin ghim lên đầu, tiếp đến thời gian tạo mới nhất).
     */
    @GetMapping("/announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements() {
        List<AnnouncementResponse> list = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Xem chi tiết một thông báo cụ thể.
     */
    @GetMapping("/announcements/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncementById(@PathVariable Long id) {
        AnnouncementResponse response = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Ban Quản Lý tạo thông báo mới (hỗ trợ đánh dấu ghim lên đầu bảng tin).
     */
    @PostMapping("/admin/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request
    ) {
        User admin = authService.getAuthenticatedUser();
        AnnouncementResponse response = announcementService.createAnnouncement(request, admin.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đăng thông báo thành công", response));
    }

    /**
     * Ban Quản Lý cập nhật nội dung hoặc trạng thái ghim của thông báo.
     */
    @PutMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request
    ) {
        AnnouncementResponse response = announcementService.updateAnnouncement(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông báo thành công", response));
    }

    /**
     * Xóa thông báo khỏi hệ thống.
     */
    @DeleteMapping("/admin/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa thông báo thành công", null));
    }
}
