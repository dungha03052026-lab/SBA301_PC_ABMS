package com.example.apartmentbs.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class ApartmentRequest {

    @NotBlank(message = "Mã căn hộ không được để trống")
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Số tầng phải lớn hơn hoặc bằng 1")
    private Integer floor;

    @NotBlank(message = "Tòa nhà/Block không được để trống")
    private String buildingBlock;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "10.00", message = "Diện tích phải lớn hơn 10m2")
    private BigDecimal areaSqm;
}
