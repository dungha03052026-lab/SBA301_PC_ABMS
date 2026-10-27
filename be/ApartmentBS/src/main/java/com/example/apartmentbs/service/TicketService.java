package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TicketResponse;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request, Long residentId);
    List<TicketResponse> getTicketsByResident(Long residentId);
    PageResponse<TicketResponse> getTicketsByResidentPaged(Long residentId, int page, int size, String sortBy, String sortDir);
    List<TicketResponse> getOpenTickets();
    PageResponse<TicketResponse> getOpenTicketsPaged(int page, int size, String sortBy, String sortDir);
    List<TicketResponse> getAssignedTickets(Long technicianId);
    PageResponse<TicketResponse> getAssignedTicketsPaged(Long technicianId, int page, int size, String sortBy, String sortDir);
    List<TicketResponse> getAllTickets();
    PageResponse<TicketResponse> getAllTicketsPaged(int page, int size, String sortBy, String sortDir);
    TicketResponse getTicketById(Long id);

    TicketResponse claimTicket(Long ticketId, Long technicianId);
    TicketResponse completeTicket(Long ticketId, TicketCompleteRequest request, Long technicianId);
    TicketResponse inspectTicket(Long ticketId, TicketRateRequest request, Long residentId);
    TicketResponse forceAssignTicket(Long ticketId, Long technicianId);
}
