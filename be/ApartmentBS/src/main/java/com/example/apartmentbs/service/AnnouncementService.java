package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.AnnouncementRequest;
import com.example.apartmentbs.dto.response.AnnouncementResponse;

import java.util.List;

public interface AnnouncementService {
    List<AnnouncementResponse> getAllAnnouncements();
    AnnouncementResponse getAnnouncementById(Long id);
    AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId);
    AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request);
    void deleteAnnouncement(Long id);
}
