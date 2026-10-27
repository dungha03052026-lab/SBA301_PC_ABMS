package com.example.apartmentbs.dto.response;

import com.example.apartmentbs.model.Apartment;
import com.example.apartmentbs.model.ApartmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApartmentResponse {
    private Long id;
    private String roomNumber;
    private Integer floor;
    private String buildingBlock;
    private BigDecimal areaSqm;
    private ApartmentStatus status;
    private UserResponse resident;
    private Integer vehicleCount;
    private LocalDateTime updatedAt;

    public static ApartmentResponse fromEntity(Apartment apt) {
        if (apt == null) return null;
        return ApartmentResponse.builder()
                .id(apt.getId())
                .roomNumber(apt.getRoomNumber())
                .floor(apt.getFloor())
                .buildingBlock(apt.getBuildingBlock())
                .areaSqm(apt.getAreaSqm())
                .status(apt.getStatus())
                .resident(UserResponse.fromEntity(apt.getResident()))
                .vehicleCount(0)
                .updatedAt(apt.getUpdatedAt())
                .build();
    }

    public static ApartmentResponse fromEntity(Apartment apt, int vehicleCount) {
        if (apt == null) return null;
        return ApartmentResponse.builder()
                .id(apt.getId())
                .roomNumber(apt.getRoomNumber())
                .floor(apt.getFloor())
                .buildingBlock(apt.getBuildingBlock())
                .areaSqm(apt.getAreaSqm())
                .status(apt.getStatus())
                .resident(UserResponse.fromEntity(apt.getResident()))
                .vehicleCount(vehicleCount)
                .updatedAt(apt.getUpdatedAt())
                .build();
    }
}
