package com.example.apartmentbs.dto.response;

import com.example.apartmentbs.model.Announcement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String content;
    private Long createdById;
    private String createdByName;
    private Boolean isPinned;
    private LocalDateTime createdAt;

    public static AnnouncementResponse fromEntity(Announcement a) {
        if (a == null) return null;
        return AnnouncementResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .createdById(a.getCreatedBy() != null ? a.getCreatedBy().getId() : null)
                .createdByName(a.getCreatedBy() != null ? a.getCreatedBy().getFullName() : null)
                .isPinned(a.getIsPinned())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
