package com.example.apartmentbs.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceBreakdown {
    private BigDecimal areaSqm;
    private BigDecimal managementFeeRate;
    private BigDecimal managementFee;

    private Integer electricUsage;
    private BigDecimal electricRate;
    private BigDecimal electricAmount;

    private Integer waterUsage;
    private BigDecimal waterRate;
    private BigDecimal waterAmount;

    private long motorbikeCount;
    private BigDecimal motorbikeFee;
    private long carCount;
    private BigDecimal carFee;
    private BigDecimal totalParkingFee;

    private BigDecimal totalAmount;
}
