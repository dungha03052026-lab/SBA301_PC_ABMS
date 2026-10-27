package com.example.apartmentbs.dto.request;

import com.example.apartmentbs.model.VehicleType;
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
public class VehicleRequest {

    @NotBlank(message = "Biển số xe không được để trống")
    private String licensePlate;

    @NotNull(message = "Loại xe không được để trống (MOTORBIKE hoặc CAR)")
    private VehicleType vehicleType;

    private String ownerName;
}
