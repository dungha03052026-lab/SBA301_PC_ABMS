package com.example.apartmentbs.service.impl;

import com.example.apartmentbs.dto.request.TicketCompleteRequest;
import com.example.apartmentbs.dto.request.TicketCreateRequest;
import com.example.apartmentbs.dto.request.TicketRateRequest;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TicketResponse;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.*;
import com.example.apartmentbs.repository.ApartmentRepository;
import com.example.apartmentbs.repository.TicketRepository;
import com.example.apartmentbs.repository.UserRepository;
import com.example.apartmentbs.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Triển khai nghiệp vụ Xử lý và Điều phối sự cố bảo trì tòa nhà (TicketServiceImpl).
 * 
 * Vòng đời sự cố và các quy tắc nghiệp vụ:
 * 1. Tạo ticket (OPEN): Tự động sinh mã ticket dạng TCK-yyyyMM-xxx.
 * 2. Nhận việc nguyên tử (Atomic Claim - BR-07): Dùng update truy vấn có điều kiện status = 'OPEN' 
 *    để chống tranh chấp tài nguyên khi nhiều kỹ thuật viên cùng bấm nhận việc cùng một lúc.
 * 3. Hoàn thành sửa chữa (RESOLVED): Kỹ thuật viên phụ trách nhập phương án khắc phục.
 * 4. Nghiệm thu & Chấm điểm (Inspect): Cư dân tạo ticket kiểm tra kết quả:
 *    - Đạt: Đánh giá số sao (1-5 sao) và đóng ticket (CLOSED).
 *    - Chưa đạt (Rework): Chuyển trạng thái ngược về IN_PROGRESS yêu cầu xử lý lại.
 * 5. Điều phối cưỡng chế (Force Assign): Admin có quyền phân công trực tiếp cho kỹ thuật viên.
 */
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;

    /**
     * Cư dân tạo báo hỏng mới với mã tự sinh theo tháng và số thứ tự.
     */
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

    /**
     * Lấy toàn bộ danh sách báo hỏng của cư dân.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByResident(Long residentId) {
        return ticketRepository.findByResidentIdOrderByCreatedAtDesc(residentId).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách báo hỏng của cư dân có phân trang và sắp xếp.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> getTicketsByResidentPaged(Long residentId, int page, int size, String sortBy, String sortDir) {
        String validSortBy = StringUtils.hasText(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));

        Page<Ticket> ticketPage = ticketRepository.findByResidentId(residentId, pageable);
        List<TicketResponse> dtoList = ticketPage.getContent().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.from(ticketPage, dtoList);
    }

    /**
     * Lấy danh sách các sự cố chưa được tiếp nhận (OPEN) trong Task Pool (không phân trang).
     */
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getOpenTickets() {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách việc chung trong Task Pool có phân trang.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> getOpenTicketsPaged(int page, int size, String sortBy, String sortDir) {
        String validSortBy = StringUtils.hasText(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));

        Page<Ticket> ticketPage = ticketRepository.findByStatus(TicketStatus.OPEN, pageable);
        List<TicketResponse> dtoList = ticketPage.getContent().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.from(ticketPage, dtoList);
    }

    /**
     * Lấy danh sách việc mà kỹ thuật viên đang đảm nhận (không phân trang).
     */
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAssignedTickets(Long technicianId) {
        return ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(technicianId).stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách việc của kỹ thuật viên có phân trang.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> getAssignedTicketsPaged(Long technicianId, int page, int size, String sortBy, String sortDir) {
        String validSortBy = StringUtils.hasText(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));

        Page<Ticket> ticketPage = ticketRepository.findByAssignedToId(technicianId, pageable);
        List<TicketResponse> dtoList = ticketPage.getContent().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.from(ticketPage, dtoList);
    }

    /**
     * Lấy toàn bộ danh sách ticket trong hệ thống cho Admin (không phân trang).
     */
    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Lấy toàn bộ danh sách ticket cho Admin có phân trang.
     */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> getAllTicketsPaged(int page, int size, String sortBy, String sortDir) {
        String validSortBy = StringUtils.hasText(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));

        Page<Ticket> ticketPage = ticketRepository.findAll(pageable);
        List<TicketResponse> dtoList = ticketPage.getContent().stream()
                .map(TicketResponse::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.from(ticketPage, dtoList);
    }

    /**
     * Lấy chi tiết ticket theo ID.
     */
    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy phiếu sự cố ID: " + id, HttpStatus.NOT_FOUND));
        return TicketResponse.fromEntity(ticket);
    }

    /**
     * Kỹ thuật viên nhận việc từ Task Pool (BR-07):
     * Thực hiện cập nhật nguyên tử (UPDATE ticket SET status='IN_PROGRESS', assigned_to=? WHERE id=? AND status='OPEN').
     * Nếu trả về 0 dòng -> Ném lỗi CONFLICT (409) do người khác đã nhanh tay nhận trước.
     */
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

    /**
     * Kỹ thuật viên hoàn thành sửa chữa (Chuyển IN_PROGRESS -> RESOLVED).
     * Yêu cầu nhập ghi chú giải pháp đã khắc phục sự cố.
     */
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

    /**
     * Cư dân nghiệm thu kết quả xử lý sự cố:
     * - Nếu hài lòng: Chấm điểm sao (1-5), đóng ticket (CLOSED).
     * - Nếu chưa đạt (rework = true): Trả lại trạng thái IN_PROGRESS để kỹ thuật viên làm lại.
     */
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

    /**
     * Ban Quản Lý chỉ định cưỡng chế kỹ thuật viên xử lý công việc (Force Assign).
     */
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
