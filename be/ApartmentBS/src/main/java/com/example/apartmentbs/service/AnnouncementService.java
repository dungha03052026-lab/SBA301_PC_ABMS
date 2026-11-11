package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.AnnouncementRequest;
import com.example.apartmentbs.dto.response.AnnouncementResponse;

import java.util.List;

/**
 * Giao diện dịch vụ Quản lý Thông báo tòa nhà (Announcement Service).
 */
public interface AnnouncementService {

    /**
     * Lấy toàn bộ danh sách thông báo tòa nhà (ưu tiên các tin được ghim).
     */
    List<AnnouncementResponse> getAllAnnouncements();

    /**
     * Lấy thông tin chi tiết của một thông báo theo ID.
     */
    AnnouncementResponse getAnnouncementById(Long id);

    /**
     * Tạo thông báo mới cho tòa nhà (chỉ dành cho Admin).
     */
    AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId);

    /**
     * Cập nhật tiêu đề, nội dung hoặc trạng thái ghim của thông báo.
     */
    AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request);

    /**
     * Xóa thông báo khỏi hệ thống.
     */
    void deleteAnnouncement(Long id);
}
