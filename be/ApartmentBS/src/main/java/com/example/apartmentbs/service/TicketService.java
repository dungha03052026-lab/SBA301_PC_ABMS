package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TicketResponse;

import java.util.List;

/**
 * Giao diện dịch vụ Xử lý và Điều phối sự cố bảo trì tòa nhà (Ticket Service).
 */
public interface TicketService {

    /**
     * Cư dân tạo mới phiếu báo hỏng kỹ thuật (Status: OPEN).
     */
    TicketResponse createTicket(TicketCreateRequest request, Long residentId);

    /**
     * Lấy danh sách báo hỏng của cư dân (không phân trang).
     */
    List<TicketResponse> getTicketsByResident(Long residentId);

    /**
     * Lấy danh sách báo hỏng của cư dân (có phân trang).
     */
    PageResponse<TicketResponse> getTicketsByResidentPaged(Long residentId, int page, int size, String sortBy, String sortDir);

    /**
     * Lấy danh sách các công việc chưa ai nhận (Status: OPEN) trong Task Pool.
     */
    List<TicketResponse> getOpenTickets();

    /**
     * Lấy danh sách các công việc OPEN trong Task Pool (có phân trang).
     */
    PageResponse<TicketResponse> getOpenTicketsPaged(int page, int size, String sortBy, String sortDir);

    /**
     * Lấy danh sách công việc được giao cho một kỹ thuật viên cụ thể.
     */
    List<TicketResponse> getAssignedTickets(Long technicianId);

    /**
     * Lấy danh sách công việc được giao cho kỹ thuật viên (có phân trang).
     */
    PageResponse<TicketResponse> getAssignedTicketsPaged(Long technicianId, int page, int size, String sortBy, String sortDir);

    /**
     * Lấy toàn bộ danh sách ticket trong hệ thống dành cho Admin.
     */
    List<TicketResponse> getAllTickets();

    /**
     * Lấy toàn bộ danh sách ticket có phân trang dành cho Admin.
     */
    PageResponse<TicketResponse> getAllTicketsPaged(int page, int size, String sortBy, String sortDir);

    /**
     * Lấy chi tiết một phiếu sự cố theo ID.
     */
    TicketResponse getTicketById(Long id);

    /**
     * Kỹ thuật viên tự nhận việc từ pool (OPEN -> IN_PROGRESS).
     */
    TicketResponse claimTicket(Long ticketId, Long technicianId);

    /**
     * Kỹ thuật viên báo hoàn thành (IN_PROGRESS -> RESOLVED).
     */
    TicketResponse completeTicket(Long ticketId, TicketCompleteRequest request, Long technicianId);

    /**
     * Cư dân nghiệm thu: đánh giá sao & đóng ticket (RESOLVED -> CLOSED) hoặc yêu cầu làm lại (RESOLVED -> IN_PROGRESS).
     */
    TicketResponse inspectTicket(Long ticketId, TicketRateRequest request, Long residentId);

    /**
     * Admin chỉ định cưỡng chế kỹ thuật viên xử lý sự cố.
     */
    TicketResponse forceAssignTicket(Long ticketId, Long technicianId);
}
