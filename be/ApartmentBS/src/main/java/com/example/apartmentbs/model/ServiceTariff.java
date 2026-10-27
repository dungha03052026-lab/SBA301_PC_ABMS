package com.example.apartmentbs.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_tariffs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTariff {

    @Id
    private Integer id;

    @Column(name = "management_fee_per_sqm", precision = 12, scale = 2, nullable = false)
    private BigDecimal managementFeePerSqm;

    @Column(name = "electricity_unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal electricityUnitPrice;

    @Column(name = "water_unit_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal waterUnitPrice;

    @Column(name = "motorbike_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal motorbikeFee;

    @Column(name = "car_fee", precision = 12, scale = 2, nullable = false)
    private BigDecimal carFee;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
