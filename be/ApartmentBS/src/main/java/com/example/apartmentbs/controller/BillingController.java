package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.BatchInvoiceCreateRequest;
import com.example.apartmentbs.dto.request.TariffRequest;
import com.example.apartmentbs.dto.response.ApiResponse;
import com.example.apartmentbs.dto.response.InvoiceResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TariffResponse;
import com.example.apartmentbs.model.InvoiceStatus;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.service.AuthService;
import com.example.apartmentbs.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller quản lý biểu phí dịch vụ tòa nhà và quy trình hóa đơn hàng tháng.
 * 
 * Luồng nghiệp vụ chính:
 * 1. Biểu phí dịch vụ (Service Tariffs): Xem công khai, Admin cập nhật đơn giá điện, nước, quản lý, gửi xe.
 * 2. Ghi chỉ số & Tạo hóa đơn hàng loạt (Batch Invoice Generation): Admin nhập số điện/nước mới, tự động tính tổng tiền.
 * 3. Duyệt hóa đơn (Invoice Approval - BR-06):
 *    - UNPAID -> Cư dân ấn "Xác nhận đã chuyển khoản" -> PENDING
 *    - PENDING -> BQL đối soát ngân hàng ấn "Phê duyệt" -> PAID
 *    - PENDING -> BQL kiểm tra chưa thấy tiền ấn "Từ chối" -> UNPAID
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final AuthService authService;

    // =========================================================================
    // TARIFF ENDPOINTS (Biểu phí dịch vụ tòa nhà)
    // =========================================================================

    /**
     * Lấy biểu phí dịch vụ hiện hành (Công khai cho toàn bộ cư dân và ban quản trị).
     */
    @GetMapping("/tariffs")
    public ResponseEntity<ApiResponse<TariffResponse>> getTariff() {
        TariffResponse response = billingService.getTariff();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    /**
     * Cập nhật đơn giá dịch vụ tòa nhà (Dành riêng cho ADMIN).
     */
    @PutMapping("/admin/tariffs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TariffResponse>> updateTariff(@Valid @RequestBody TariffRequest request) {
        TariffResponse response = billingService.updateTariff(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật biểu phí thành công", response));
    }

    // =========================================================================
    // ADMIN INVOICE ENDPOINTS (Quản lý hóa đơn - Phân hệ BQL)
    // =========================================================================

    /**
     * Tra cứu danh sách hóa đơn có phân trang dành cho Admin (lọc theo kỳ hóa đơn, trạng thái, căn hộ).
     */
    @GetMapping("/admin/invoices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<InvoiceResponse>>> searchInvoices(
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long apartmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<InvoiceResponse> result = billingService.searchInvoicesPaged(
                billingMonth, status, apartmentId, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Lấy toàn bộ danh sách hóa đơn không phân trang (phục vụ xuất dữ liệu thống kê).
     */
    @GetMapping("/admin/invoices/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices(
            @RequestParam(required = false) String billingMonth,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long apartmentId
    ) {
        List<InvoiceResponse> list = billingService.searchInvoices(billingMonth, status, apartmentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Chốt số chỉ số công tơ và sinh hóa đơn hàng loạt cho các căn hộ có người ở (OCCUPIED).
     */
    @PostMapping("/admin/invoices/batch-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> batchGenerateInvoices(
            @Valid @RequestBody BatchInvoiceCreateRequest request
    ) {
        List<InvoiceResponse> list = billingService.batchGenerateInvoices(request);
        return ResponseEntity.ok(ApiResponse.ok("Chốt số và tạo hóa đơn thành công (" + list.size() + " hóa đơn)", list));
    }

    /**
     * Phê duyệt đối soát thanh toán hóa đơn (Chuyển PENDING -> PAID).
     */
    @PutMapping("/admin/invoices/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> approveInvoice(@PathVariable Long id) {
        User admin = authService.getAuthenticatedUser();
        InvoiceResponse response = billingService.approveInvoice(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã phê duyệt thanh toán hóa đơn " + response.getInvoiceCode(), response));
    }

    /**
     * Từ chối thanh toán khi chưa thấy tiền về tài khoản (Chuyển PENDING -> UNPAID).
     */
    @PutMapping("/admin/invoices/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> rejectInvoice(@PathVariable Long id) {
        InvoiceResponse response = billingService.rejectInvoice(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã từ chối xác nhận thanh toán", response));
    }

    // =========================================================================
    // RESIDENT INVOICE ENDPOINTS (Hóa đơn - Phân hệ Cư dân)
    // =========================================================================

    /**
     * Lấy danh sách hóa đơn của căn hộ mà cư dân đang chọn xem.
     */
    @GetMapping("/resident/invoices")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getResidentInvoices(
            @RequestParam(required = false) Long apartmentId
    ) {
        if (apartmentId == null) {
            User user = authService.getAuthenticatedUser();
            List<InvoiceResponse> list = billingService.searchInvoices(null, null, null);
            list = list.stream()
                    .filter(inv -> inv.getApartmentId() != null && user.getId().equals(inv.getApartmentId()))
                    .toList();
            return ResponseEntity.ok(ApiResponse.ok(list));
        }
        List<InvoiceResponse> list = billingService.getInvoicesByApartment(apartmentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Cư dân gửi xác nhận đã thanh toán chuyển khoản thành công (Chuyển trạng thái UNPAID -> PENDING).
     */
    @PostMapping("/resident/invoices/{id}/confirm-payment")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> confirmPayment(@PathVariable Long id) {
        User resident = authService.getAuthenticatedUser();
        InvoiceResponse response = billingService.confirmPayment(id, resident.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi yêu cầu xác nhận chuyển khoản tới Ban Quản Lý (PENDING)", response));
    }
}
