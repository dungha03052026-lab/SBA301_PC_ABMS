package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.ForceAssignRequest;
import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.ApiResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TicketResponse;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.service.AuthService;
import com.example.apartmentbs.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller điều phối quy trình vòng đời sự cố và báo hỏng kỹ thuật (Tickets Lifecycle).
 * 
 * Vòng đời sự cố:
 * 1. OPEN: Cư dân tạo báo hỏng từ phân hệ Resident.
 * 2. IN_PROGRESS: Kỹ thuật viên tự nhận việc (Claim) từ Task Pool HOẶC BQL cưỡng chế giao việc (Force Assign).
 * 3. RESOLVED: Kỹ thuật viên sửa chữa xong, nhập ghi chú giải pháp và báo hoàn thành.
 * 4. CLOSED: Cư dân nghiệm thu đạt yêu cầu và chấm điểm sao đánh giá.
 *    (Nếu cư dân không hài lòng -> Rework: Chuyển lại trạng thái IN_PROGRESS để làm lại).
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AuthService authService;

    // =========================================================================
    // ADMIN ENDPOINTS (Ban Quản Lý theo dõi và điều phối kỹ thuật)
    // =========================================================================

    /**
     * Lấy toàn bộ danh sách sự cố có phân trang và sắp xếp cho Admin.
     */
    @GetMapping("/admin/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        PageResponse<TicketResponse> list = ticketService.getAllTicketsPaged(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Lấy toàn bộ danh sách sự cố không phân trang cho Admin.
     */
    @GetMapping("/admin/tickets/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTicketsList() {
        List<TicketResponse> list = ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * BQL cưỡng chế chỉ định kỹ thuật viên xử lý sự cố (Force Assign).
     */
    @PutMapping("/admin/tickets/{id}/force-assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> forceAssignTicket(
            @PathVariable Long id,
            @Valid @RequestBody ForceAssignRequest request
    ) {
        TicketResponse response = ticketService.forceAssignTicket(id, request.getTechnicianId());
        return ResponseEntity.ok(ApiResponse.ok("Đã điều phối kỹ thuật viên xử lý sự cố", response));
    }

    // =========================================================================
    // RESIDENT ENDPOINTS (Cư dân tạo báo hỏng và nghiệm thu đánh giá)
    // =========================================================================

    /**
     * Lấy danh sách các báo hỏng do chính cư dân đang đăng nhập tạo (có phân trang).
     */
    @GetMapping("/resident/tickets")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getResidentTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        User resident = authService.getAuthenticatedUser();
        PageResponse<TicketResponse> list = ticketService.getTicketsByResidentPaged(resident.getId(), page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Lấy toàn bộ danh sách báo hỏng của cư dân không phân trang.
     */
    @GetMapping("/resident/tickets/all")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getResidentTicketsList() {
        User resident = authService.getAuthenticatedUser();
        List<TicketResponse> list = ticketService.getTicketsByResident(resident.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Cư dân gửi yêu cầu sửa chữa mới (Tạo ticket trạng thái OPEN).
     */
    @PostMapping("/resident/tickets")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody TicketCreateRequest request
    ) {
        User resident = authService.getAuthenticatedUser();
        TicketResponse response = ticketService.createTicket(request, resident.getId());
        return ResponseEntity.ok(ApiResponse.ok("Tạo phiếu báo hỏng thành công", response));
    }

    /**
     * Cư dân nghiệm thu kết quả sửa chữa (Đánh giá đóng ticket HOẶC yêu cầu làm lại).
     */
    @PostMapping("/resident/tickets/{id}/inspect")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<TicketResponse>> inspectTicket(
            @PathVariable Long id,
            @RequestBody TicketRateRequest request
    ) {
        User resident = authService.getAuthenticatedUser();
        TicketResponse response = ticketService.inspectTicket(id, request, resident.getId());
        String msg = Boolean.TRUE.equals(request.getRework())
                ? "Đã gửi yêu cầu làm lại cho kỹ thuật viên"
                : "Đã nghiệm thu và đánh giá sự cố thành công";
        return ResponseEntity.ok(ApiResponse.ok(msg, response));
    }

    // =========================================================================
    // TECHNICIAN ENDPOINTS (Kỹ thuật viên nhận việc và báo hoàn thành)
    // =========================================================================

    /**
     * Lấy danh sách sự cố đang chờ xử lý trong kho việc chung (Task Pool - Trạng thái OPEN) có phân trang.
     */
    @GetMapping("/technician/tickets/pool")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getOpenTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PageResponse<TicketResponse> list = ticketService.getOpenTicketsPaged(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Lấy toàn bộ danh sách việc chung trong pool (không phân trang).
     */
    @GetMapping("/technician/tickets/pool/all")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getOpenTicketsList() {
        List<TicketResponse> list = ticketService.getOpenTickets();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Lấy danh sách các công việc đã được phân công cho kỹ thuật viên đang đăng nhập (có phân trang).
     */
    @GetMapping("/technician/tickets/my-tasks")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getMyTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        User tech = authService.getAuthenticatedUser();
        PageResponse<TicketResponse> list = ticketService.getAssignedTicketsPaged(tech.getId(), page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Lấy danh sách việc của tôi không phân trang.
     */
    @GetMapping("/technician/tickets/my-tasks/all")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTasksList() {
        User tech = authService.getAuthenticatedUser();
        List<TicketResponse> list = ticketService.getAssignedTickets(tech.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Kỹ thuật viên chủ động nhận việc từ kho Task Pool (Chuyển OPEN -> IN_PROGRESS).
     */
    @PostMapping("/technician/tickets/{id}/claim")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponse>> claimTicket(@PathVariable Long id) {
        User tech = authService.getAuthenticatedUser();
        TicketResponse response = ticketService.claimTicket(id, tech.getId());
        return ResponseEntity.ok(ApiResponse.ok("Nhận việc thành công! Công việc đã được chuyển vào mục 'Việc của tôi'", response));
    }

    /**
     * Kỹ thuật viên báo hoàn thành sửa chữa (Chuyển IN_PROGRESS -> RESOLVED).
     */
    @PostMapping("/technician/tickets/{id}/complete")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponse>> completeTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketCompleteRequest request
    ) {
        User tech = authService.getAuthenticatedUser();
        TicketResponse response = ticketService.completeTicket(id, request, tech.getId());
        return ResponseEntity.ok(ApiResponse.ok("Đã báo hoàn thành và chuyển trạng thái chờ cư dân nghiệm thu", response));
    }
}
