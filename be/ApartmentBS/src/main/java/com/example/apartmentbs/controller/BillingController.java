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

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final AuthService authService;

    // --- TARIFF ENDPOINTS ---
    @GetMapping("/tariffs")
    public ResponseEntity<ApiResponse<TariffResponse>> getTariff() {
        TariffResponse response = billingService.getTariff();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/admin/tariffs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TariffResponse>> updateTariff(@Valid @RequestBody TariffRequest request) {
        TariffResponse response = billingService.updateTariff(request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật biểu phí thành công", response));
    }

    // --- ADMIN INVOICE ENDPOINTS ---
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

    @PostMapping("/admin/invoices/batch-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> batchGenerateInvoices(
            @Valid @RequestBody BatchInvoiceCreateRequest request
    ) {
        List<InvoiceResponse> list = billingService.batchGenerateInvoices(request);
        return ResponseEntity.ok(ApiResponse.ok("Chốt số và tạo hóa đơn thành công (" + list.size() + " hóa đơn)", list));
    }

    @PutMapping("/admin/invoices/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> approveInvoice(@PathVariable Long id) {
        User admin = authService.getAuthenticatedUser();
        InvoiceResponse response = billingService.approveInvoice(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã phê duyệt thanh toán hóa đơn " + response.getInvoiceCode(), response));
    }

    @PutMapping("/admin/invoices/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> rejectInvoice(@PathVariable Long id) {
        InvoiceResponse response = billingService.rejectInvoice(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã từ chối xác nhận thanh toán", response));
    }

    // --- RESIDENT INVOICE ENDPOINTS ---
    @GetMapping("/resident/invoices")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getResidentInvoices(
            @RequestParam(required = false) Long apartmentId
    ) {
        if (apartmentId == null) {
            User user = authService.getAuthenticatedUser();
            List<InvoiceResponse> list = billingService.searchInvoices(null, null, null);
            list = list.stream()
                    .filter(inv -> inv.getApartmentId() != null && user.getId().equals(inv.getApartmentId())) // or by apartment resident
                    .toList();
            return ResponseEntity.ok(ApiResponse.ok(list));
        }
        List<InvoiceResponse> list = billingService.getInvoicesByApartment(apartmentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/resident/invoices/{id}/confirm-payment")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<InvoiceResponse>> confirmPayment(@PathVariable Long id) {
        User resident = authService.getAuthenticatedUser();
        InvoiceResponse response = billingService.confirmPayment(id, resident.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi yêu cầu xác nhận chuyển khoản tới Ban Quản Lý (PENDING)", response));
    }
}
