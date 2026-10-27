package com.example.apartmentbs.service.impl;

import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.TicketResponse;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.*;
import com.example.apartmentbs.repository.ApartmentRepository;
import com.example.apartmentbs.repository.TicketRepository;
import com.example.apartmentbs.repository.UserRepository;
import com.example.apartmentbs.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, Long residentId) {
        User resident = userRepository.findById(residentId)
                .orElseThrow(() -> new AppException("Không tìm thấy cư dân"));

        Apartment apt = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new AppException("Không tìm thấy căn hộ có ID: " + request.getApartmentId()));

        String monthPrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long count = ticketRepository.count() + 1;
        String ticketCode = String.format("TCK-%s-%03d", monthPrefix, count);

        Ticket ticket = Ticket.builder()
                .ticketCode(ticketCode)
                .apartment(apt)
                .resident(resident)
                .category(request.getCategory())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .imageUrl(request.getImageUrl())
                .status(TicketStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByResident(Long residentId) {
        return ticketRepository.findByResidentIdOrderByCreatedAtDesc(residentId).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getOpenTickets() {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAssignedTickets(Long technicianId) {
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(technicianId).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy phiếu sự cố ID: " + id, HttpStatus.NOT_FOUND));
        return TicketResponse.fromEntity(ticket);
    }

    @Override
    @Transactional
    public TicketResponse claimTicket(Long ticketId, Long technicianId) {
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new AppException("Không tìm thấy kỹ thuật viên"));

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new AppException("Chỉ Kỹ thuật viên mới có quyền nhận việc từ Chợ việc!", HttpStatus.FORBIDDEN);
        }

        // BR-07: NHẬN VIỆC NGUYÊN TỬ (ATOMIC CLAIM) CHỐNG XUNG ĐỘT CONCURRENCY
        int affectedRows = ticketRepository.claimTicket(ticketId, technician);
        if (affectedRows == 0) {
            throw new AppException(
                    "Công việc này vừa được một kỹ thuật viên khác tiếp nhận hoặc không còn ở trạng thái Chờ xử lý!",
                    HttpStatus.CONFLICT
            );
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Không tìm thấy phiếu sự cố"));
        return TicketResponse.fromEntity(ticket);
    }

    @Override
    @Transactional
    public TicketResponse completeTicket(Long ticketId, TicketCompleteRequest request, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Không tìm thấy phiếu sự cố"));

        if (ticket.getAssignedTo() == null || !ticket.getAssignedTo().getId().equals(technicianId)) {
            throw new AppException("Bạn không phải là kỹ thuật viên được giao xử lý công việc này!", HttpStatus.FORBIDDEN);
        }

        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new AppException("Chỉ có thể báo hoàn thành khi công việc đang ở trạng thái Đang xử lý (IN_PROGRESS)!");
        }

        ticket.setStatus(TicketStatus.RESOLVED);
        ticket.setTechnicianNote(request.getTechnicianNote().trim());
        ticket.setResolvedAt(LocalDateTime.now());

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public TicketResponse inspectTicket(Long ticketId, TicketRateRequest request, Long residentId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Không tìm thấy phiếu sự cố"));

        if (!ticket.getResident().getId().equals(residentId)) {
            throw new AppException("Chỉ cư dân tạo phiếu mới có quyền nghiệm thu và đánh giá!", HttpStatus.FORBIDDEN);
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            throw new AppException("Chỉ có thể nghiệm thu khi kỹ thuật viên đã báo hoàn thành (RESOLVED)!");
        }

        if (Boolean.TRUE.equals(request.getRework())) {
            // Yêu cầu làm lại -> chuyển về IN_PROGRESS
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        } else {
            // Hài lòng -> đánh giá sao và Đóng phiếu
            int rating = (request.getRating() != null) ? request.getRating() : 5;
            ticket.setRating(rating);
            ticket.setStatus(TicketStatus.CLOSED);
        }

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public TicketResponse forceAssignTicket(Long ticketId, Long technicianId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new AppException("Không tìm thấy phiếu sự cố"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new AppException("Không tìm thấy kỹ thuật viên"));

        ticket.setAssignedTo(technician);
        ticket.setStatus(TicketStatus.IN_PROGRESS);

        Ticket saved = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(saved);
    }
}
