package com.example.apartmentbs.dto.response;

import com.example.apartmentbs.model.Invoice;
import com.example.apartmentbs.model.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceCode;
    private Long apartmentId;
    private String roomNumber;
    private Integer floor;
    private String buildingBlock;
    private String residentName;
    private String residentPhone;

    private String billingMonth;
    private Integer oldElectricNum;
    private Integer newElectricNum;
    private Integer electricUsage;

    private Integer oldWaterNum;
    private Integer newWaterNum;
    private Integer waterUsage;

    private BigDecimal totalAmount;
    private InvoiceStatus status;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    private String approvedByName;
    private LocalDateTime createdAt;

    private InvoiceBreakdown breakdown;
    private String vietQrUrl;

    public static InvoiceResponse fromEntity(Invoice invoice) {
        if (invoice == null) return null;

        int electricUsage = invoice.getNewElectricNum() - invoice.getOldElectricNum();
        int waterUsage = invoice.getNewWaterNum() - invoice.getOldWaterNum();

        String room = invoice.getApartment() != null ? invoice.getApartment().getRoomNumber() : "";
        String residentName = (invoice.getApartment() != null && invoice.getApartment().getResident() != null)
                ? invoice.getApartment().getResident().getFullName() : "";
        String residentPhone = (invoice.getApartment() != null && invoice.getApartment().getResident() != null)
                ? invoice.getApartment().getResident().getPhoneNumber() : "";

        // VietQR generator URL
        // Format: https://img.vietqr.io/image/MB-0335888888-compact2.png?amount={total}&addInfo=THANH TOAN {code}&accountName=BQL CHUNG CU
        String vietQrUrl = String.format(
                "https://img.vietqr.io/image/MB-0335888888-compact2.png?amount=%s&addInfo=THANH TOAN %s&accountName=BQL CHUNG CU",
                invoice.getTotalAmount().toBigInteger().toString(),
                invoice.getInvoiceCode()
        );

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceCode(invoice.getInvoiceCode())
                .apartmentId(invoice.getApartment() != null ? invoice.getApartment().getId() : null)
                .roomNumber(room)
                .floor(invoice.getApartment() != null ? invoice.getApartment().getFloor() : null)
                .buildingBlock(invoice.getApartment() != null ? invoice.getApartment().getBuildingBlock() : "")
                .residentName(residentName)
                .residentPhone(residentPhone)
                .billingMonth(invoice.getBillingMonth())
                .oldElectricNum(invoice.getOldElectricNum())
                .newElectricNum(invoice.getNewElectricNum())
                .electricUsage(electricUsage)
                .oldWaterNum(invoice.getOldWaterNum())
                .newWaterNum(invoice.getNewWaterNum())
                .waterUsage(waterUsage)
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .dueDate(invoice.getDueDate())
                .paidAt(invoice.getPaidAt())
                .approvedByName(invoice.getApprovedBy() != null ? invoice.getApprovedBy().getFullName() : null)
                .createdAt(invoice.getCreatedAt())
                .vietQrUrl(vietQrUrl)
                .build();
    }
}
