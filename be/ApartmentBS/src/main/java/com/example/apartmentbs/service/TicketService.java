package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.TicketResponse;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(TicketCreateRequest request, Long residentId);
    List<TicketResponse> getTicketsByResident(Long residentId);
    List<TicketResponse> getOpenTickets();
    List<TicketResponse> getAssignedTickets(Long technicianId);
    List<TicketResponse> getAllTickets();
    TicketResponse getTicketById(Long id);

    TicketResponse claimTicket(Long ticketId, Long technicianId);
    TicketResponse completeTicket(Long ticketId, TicketCompleteRequest request, Long technicianId);
    TicketResponse inspectTicket(Long ticketId, TicketRateRequest request, Long residentId);
    TicketResponse forceAssignTicket(Long ticketId, Long technicianId);
}
