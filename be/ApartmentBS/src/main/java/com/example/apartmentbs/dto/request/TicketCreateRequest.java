package com.example.apartmentbs.dto.request;

import com.example.apartmentbs.model.TicketCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreateRequest {

    @NotNull(message = "ID căn hộ không được để trống")
    private Long apartmentId;

    @NotNull(message = "Phân loại sự cố không được để trống (ELECTRIC, PLUMBING, OTHER)")
    private TicketCategory category;

    @NotBlank(message = "Tiêu đề sự cố không được để trống")
    private String title;

    @NotBlank(message = "Mô tả chi tiết không được để trống")
    private String description;

    private String imageUrl;
}
