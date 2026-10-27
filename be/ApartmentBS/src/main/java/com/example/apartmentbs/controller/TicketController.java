package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.ForceAssignRequest;
import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.ApiResponse;
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

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AuthService authService;

    // --- ADMIN ENDPOINTS ---
    @GetMapping("/admin/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        List<TicketResponse> list = ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/admin/tickets/{id}/force-assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> forceAssignTicket(
            @PathVariable Long id,
            @Valid @RequestBody ForceAssignRequest request
    ) {
        TicketResponse response = ticketService.forceAssignTicket(id, request.getTechnicianId());
        return ResponseEntity.ok(ApiResponse.ok("Đã điều phối kỹ thuật viên xử lý sự cố", response));
    }

    // --- RESIDENT ENDPOINTS ---
    @GetMapping("/resident/tickets")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getResidentTickets() {
        User resident = authService.getAuthenticatedUser();
        List<TicketResponse> list = ticketService.getTicketsByResident(resident.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/resident/tickets")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody TicketCreateRequest request
    ) {
        User resident = authService.getAuthenticatedUser();
        TicketResponse response = ticketService.createTicket(request, resident.getId());
        return ResponseEntity.ok(ApiResponse.ok("Tạo phiếu báo hỏng thành công", response));
    }

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

    // --- TECHNICIAN ENDPOINTS ---
    @GetMapping("/technician/tickets/pool")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getOpenTickets() {
        List<TicketResponse> list = ticketService.getOpenTickets();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/technician/tickets/my-tasks")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTasks() {
        User tech = authService.getAuthenticatedUser();
        List<TicketResponse> list = ticketService.getAssignedTickets(tech.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/technician/tickets/{id}/claim")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<ApiResponse<TicketResponse>> claimTicket(@PathVariable Long id) {
        User tech = authService.getAuthenticatedUser();
        TicketResponse response = ticketService.claimTicket(id, tech.getId());
        return ResponseEntity.ok(ApiResponse.ok("Nhận việc thành công! Công việc đã được chuyển vào mục 'Việc của tôi'", response));
    }

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
