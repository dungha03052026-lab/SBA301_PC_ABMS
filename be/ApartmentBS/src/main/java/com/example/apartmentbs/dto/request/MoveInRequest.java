package com.example.apartmentbs.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoveInRequest {
    // Nếu chọn cư dân đã có trong hệ thống (Hỗ trợ 1 cư dân sở hữu nhiều căn BR-02)
    private Long residentId;

    // Nếu là cư dân mới
    private String fullName;
    private String phoneNumber;
    private String email;
}
