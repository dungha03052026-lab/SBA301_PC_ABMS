package com.example.apartmentbs.service.impl;

import com.example.apartmentbs.dto.request.AnnouncementRequest;
import com.example.apartmentbs.dto.response.AnnouncementResponse;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.Announcement;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.repository.AnnouncementRepository;
import com.example.apartmentbs.repository.UserRepository;
import com.example.apartmentbs.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByIsPinnedDescCreatedAtDesc().stream()
                .map(AnnouncementResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy thông báo ID: " + id, HttpStatus.NOT_FOUND));
        return AnnouncementResponse.fromEntity(announcement);
    }

    @Override
    @Transactional
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException("Không tìm thấy Admin tạo thông báo"));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .createdBy(admin)
                .isPinned(Boolean.TRUE.equals(request.getIsPinned()))
                .createdAt(LocalDateTime.now())
                .build();

        Announcement saved = announcementRepository.save(announcement);
        return AnnouncementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy thông báo ID: " + id, HttpStatus.NOT_FOUND));

        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getContent().trim());
        announcement.setIsPinned(Boolean.TRUE.equals(request.getIsPinned()));

        Announcement saved = announcementRepository.save(announcement);
        return AnnouncementResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy thông báo ID: " + id, HttpStatus.NOT_FOUND));
        announcementRepository.delete(announcement);
    }
}
