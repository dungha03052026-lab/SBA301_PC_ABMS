package com.example.apartmentbs.dto.response;

import com.example.apartmentbs.model.Vehicle;
import com.example.apartmentbs.model.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Long id;
    private Long apartmentId;
    private String licensePlate;
    private VehicleType vehicleType;
    private String ownerName;
    private LocalDateTime createdAt;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        if (vehicle == null) return null;
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .apartmentId(vehicle.getApartment() != null ? vehicle.getApartment().getId() : null)
                .licensePlate(vehicle.getLicensePlate())
                .vehicleType(vehicle.getVehicleType())
                .ownerName(vehicle.getOwnerName())
                .createdAt(vehicle.getCreatedAt())
                .build();
    }
}
