package com.example.apartmentbs.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TariffRequest {

    @NotNull(message = "Phí quản lý không được để trống")
    @DecimalMin(value = "0.0", message = "Phí quản lý phải >= 0")
    private BigDecimal managementFeePerSqm;

    @NotNull(message = "Đơn giá điện không được để trống")
    @DecimalMin(value = "0.0", message = "Đơn giá điện phải >= 0")
    private BigDecimal electricityUnitPrice;

    @NotNull(message = "Đơn giá nước không được để trống")
    @DecimalMin(value = "0.0", message = "Đơn giá nước phải >= 0")
    private BigDecimal waterUnitPrice;

    @NotNull(message = "Phí gửi xe máy không được để trống")
    @DecimalMin(value = "0.0", message = "Phí gửi xe máy phải >= 0")
    private BigDecimal motorbikeFee;

    @NotNull(message = "Phí gửi ô tô không được để trống")
    @DecimalMin(value = "0.0", message = "Phí gửi ô tô phải >= 0")
    private BigDecimal carFee;
}
