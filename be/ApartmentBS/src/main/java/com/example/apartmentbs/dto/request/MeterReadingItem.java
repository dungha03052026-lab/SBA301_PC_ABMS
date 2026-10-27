package com.example.apartmentbs.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeterReadingItem {

    @NotNull(message = "ID căn hộ không được để trống")
    private Long apartmentId;

    @NotNull(message = "Chỉ số điện cũ không được để trống")
    @Min(value = 0, message = "Chỉ số điện cũ phải >= 0")
    private Integer oldElectricNum;

    @NotNull(message = "Chỉ số điện mới không được để trống")
    @Min(value = 0, message = "Chỉ số điện mới phải >= 0")
    private Integer newElectricNum;

    @NotNull(message = "Chỉ số nước cũ không được để trống")
    @Min(value = 0, message = "Chỉ số nước cũ phải >= 0")
    private Integer oldWaterNum;

    @NotNull(message = "Chỉ số nước mới không được để trống")
    @Min(value = 0, message = "Chỉ số nước mới phải >= 0")
    private Integer newWaterNum;
}
