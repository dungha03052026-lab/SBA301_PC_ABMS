package com.example.apartmentbs.dto.response;

import com.example.apartmentbs.model.ServiceTariff;
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
public class TariffResponse {
    private Integer id;
    private BigDecimal managementFeePerSqm;
    private BigDecimal electricityUnitPrice;
    private BigDecimal waterUnitPrice;
    private BigDecimal motorbikeFee;
    private BigDecimal carFee;
    private LocalDateTime updatedAt;

    public static TariffResponse fromEntity(ServiceTariff tariff) {
        if (tariff == null) return null;
        return TariffResponse.builder()
                .id(tariff.getId())
                .managementFeePerSqm(tariff.getManagementFeePerSqm())
                .electricityUnitPrice(tariff.getElectricityUnitPrice())
                .waterUnitPrice(tariff.getWaterUnitPrice())
                .motorbikeFee(tariff.getMotorbikeFee())
                .carFee(tariff.getCarFee())
                .updatedAt(tariff.getUpdatedAt())
                .build();
    }
}
