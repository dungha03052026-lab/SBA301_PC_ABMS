package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Invoice;
import com.example.apartmentbs.model.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu cho thực thể Hóa đơn dịch vụ hàng tháng (Invoice).
 */
@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {

    /**
     * Tìm hóa đơn theo mã code (Ví dụ: INV-202611-A101).
     */
    Optional<Invoice> findByInvoiceCode(String invoiceCode);

    /**
     * Lấy tất cả hóa đơn của một căn hộ.
     */
    List<Invoice> findByApartmentId(Long apartmentId);

    /**
     * Lấy danh sách hóa đơn của căn hộ sắp xếp theo kỳ tháng giảm dần.
     */
    List<Invoice> findByApartmentIdOrderByBillingMonthDesc(Long apartmentId);

    /**
     * Lấy hóa đơn của căn hộ có phân trang.
     */
    Page<Invoice> findByApartmentId(Long apartmentId, Pageable pageable);

    /**
     * Lấy hóa đơn của căn hộ nằm trong tập trạng thái chỉ định.
     */
    List<Invoice> findByApartmentIdAndStatusIn(Long apartmentId, Collection<InvoiceStatus> statuses);

    /**
     * Đếm số lượng hóa đơn chưa thanh toán/chờ duyệt của căn hộ (kiểm tra công nợ Move-Out BR-04).
     */
    long countByApartmentIdAndStatusIn(Long apartmentId, Collection<InvoiceStatus> statuses);

    /**
     * Lấy danh sách hóa đơn theo kỳ tháng (Ví dụ: '2026-11').
     */
    List<Invoice> findByBillingMonth(String billingMonth);

    /**
     * Lấy danh sách hóa đơn theo kỳ tháng có phân trang.
     */
    Page<Invoice> findByBillingMonth(String billingMonth, Pageable pageable);

    /**
     * Tìm hóa đơn của một căn hộ trong một kỳ tháng cụ thể (chống sinh trùng).
     */
    Optional<Invoice> findByApartmentIdAndBillingMonth(Long apartmentId, String billingMonth);

    /**
     * Lấy danh sách hóa đơn theo trạng thái (UNPAID, PENDING, PAID).
     */
    List<Invoice> findByStatus(InvoiceStatus status);

    /**
     * Lấy danh sách hóa đơn theo trạng thái có phân trang.
     */
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    /**
     * Lấy toàn bộ hóa đơn sắp xếp theo thời điểm tạo mới nhất.
     */
    List<Invoice> findAllByOrderByCreatedAtDesc();
}
