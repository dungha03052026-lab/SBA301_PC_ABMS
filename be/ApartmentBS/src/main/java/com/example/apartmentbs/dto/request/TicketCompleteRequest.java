package com.example.apartmentbs.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCompleteRequest {

    @NotBlank(message = "Ghi chú kỹ thuật xử lý không được để trống")
    private String technicianNote;
}
