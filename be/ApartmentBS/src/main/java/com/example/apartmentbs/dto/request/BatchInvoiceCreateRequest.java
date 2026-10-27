package com.example.apartmentbs.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchInvoiceCreateRequest {

    @NotNull(message = "Kỳ hóa đơn không được để trống")
    @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Kỳ hóa đơn phải có định dạng YYYY-MM (ví dụ: 2026-10)")
    private String billingMonth;

    private LocalDate dueDate;

    @NotEmpty(message = "Danh sách chỉ số không được để trống")
    @Valid
    private List<MeterReadingItem> readings;
}
