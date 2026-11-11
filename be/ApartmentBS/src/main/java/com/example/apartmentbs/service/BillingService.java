package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.BatchInvoiceCreateRequest;
import com.example.apartmentbs.dto.request.TariffRequest;
import com.example.apartmentbs.dto.response.InvoiceResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TariffResponse;
import com.example.apartmentbs.model.InvoiceStatus;

import java.util.List;

/**
 * Giao diện dịch vụ Quản lý Biểu phí và Hóa đơn tòa nhà (Billing Service).
 */
public interface BillingService {

    /**
     * Lấy bảng biểu phí dịch vụ hiện tại của tòa nhà.
     */
    TariffResponse getTariff();

    /**
     * Cập nhật các mức đơn giá dịch vụ (phí quản lý/m2, điện, nước, gửi ô tô, xe máy).
     */
    TariffResponse updateTariff(TariffRequest request);

    /**
     * Tìm kiếm danh sách hóa đơn theo kỳ, trạng thái hoặc căn hộ (không phân trang).
     */
    List<InvoiceResponse> searchInvoices(String billingMonth, InvoiceStatus status, Long apartmentId);

    /**
     * Tìm kiếm danh sách hóa đơn có phân trang và sắp xếp.
     */
    PageResponse<InvoiceResponse> searchInvoicesPaged(String billingMonth, InvoiceStatus status, Long apartmentId, int page, int size, String sortBy, String sortDir);

    /**
     * Xem thông tin chi tiết một hóa đơn (bao gồm bảng phân tích chi phí breakdown).
     */
    InvoiceResponse getInvoiceById(Long id);

    /**
     * Lấy danh sách hóa đơn của một căn hộ cụ thể (sắp xếp theo tháng giảm dần).
     */
    List<InvoiceResponse> getInvoicesByApartment(Long apartmentId);

    /**
     * Chốt số công tơ điện nước và tạo hóa đơn hàng loạt (Batch Invoice Generation).
     */
    List<InvoiceResponse> batchGenerateInvoices(BatchInvoiceCreateRequest request);

    /**
     * Cư dân xác nhận đã thanh toán chuyển khoản (UNPAID -> PENDING).
     */
    InvoiceResponse confirmPayment(Long invoiceId, Long residentId);

    /**
     * Ban Quản Lý phê duyệt đã nhận tiền thành công (PENDING -> PAID - BR-06).
     */
    InvoiceResponse approveInvoice(Long invoiceId, Long adminId);

    /**
     * Ban Quản Lý từ chối do sai sót chuyển khoản (PENDING -> UNPAID - BR-06).
     */
    InvoiceResponse rejectInvoice(Long invoiceId);
}
