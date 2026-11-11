package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Ticket;
import com.example.apartmentbs.model.TicketStatus;
import com.example.apartmentbs.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu cho thực thể Phiếu sự cố kỹ thuật (Ticket).
 */
@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

    /**
     * Tìm ticket theo mã định danh (Ví dụ: TCK-202611-001).
     */
    Optional<Ticket> findByTicketCode(String ticketCode);

    /**
     * Lấy danh sách sự cố của một căn hộ cụ thể.
     */
    List<Ticket> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);

    /**
     * Lấy danh sách sự cố do cư dân tạo (sắp xếp mới nhất).
     */
    List<Ticket> findByResidentIdOrderByCreatedAtDesc(Long residentId);

    /**
     * Lấy danh sách sự cố của cư dân có phân trang.
     */
    Page<Ticket> findByResidentId(Long residentId, Pageable pageable);

    /**
     * Lấy danh sách việc được giao cho kỹ thuật viên.
     */
    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long technicianId);

    /**
     * Lấy danh sách việc được giao cho kỹ thuật viên có phân trang.
     */
    Page<Ticket> findByAssignedToId(Long technicianId, Pageable pageable);

    /**
     * Lấy danh sách ticket theo trạng thái (Ví dụ: OPEN trong Task Pool).
     */
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

    /**
     * Lấy danh sách ticket theo trạng thái có phân trang.
     */
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    /**
     * Lấy toàn bộ ticket sắp xếp mới nhất lên đầu.
     */
    List<Ticket> findAllByOrderByCreatedAtDesc();

    /**
     * Nhận việc nguyên tử (Atomic Claim - BR-07):
     * Cập nhật gán kỹ thuật viên và chuyển status từ OPEN sang IN_PROGRESS.
     * Trả về số dòng bị ảnh hưởng (1 nếu thành công, 0 nếu ticket đã bị người khác nhận trước).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Ticket t SET t.status = com.example.apartmentbs.model.TicketStatus.IN_PROGRESS, t.assignedTo = :technician WHERE t.id = :ticketId AND t.status = com.example.apartmentbs.model.TicketStatus.OPEN")
    int claimTicket(@Param("ticketId") Long ticketId, @Param("technician") User technician);
}
