package com.example.apartmentbs.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForceAssignRequest {
    @NotNull(message = "ID kỹ thuật viên không được để trống")
    private Long technicianId;
}
