package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.*;
import com.example.apartmentbs.dto.response.*;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.*;
import com.example.apartmentbs.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AllUseCasesIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private BillingService billingService;

    @Autowired
    private TicketService ticketService;

    @Autowired
    private AnnouncementService announcementService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private ServiceTariffRepository tariffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User residentUser;
    private User technicianUser;
    private Apartment apt1;
    private Apartment apt2;

    @BeforeEach
    void setUp() {
        // Tạo người dùng mẫu Admin
        adminUser = User.builder()
                .phoneNumber("0901000099")
                .email("admin.test@building.vn")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("BQL Test Admin")
                .role(Role.ADMIN)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
        adminUser = userRepository.save(adminUser);

        // Tạo người dùng mẫu Resident
        residentUser = User.builder()
                .phoneNumber("0903000099")
                .email("resident.test@building.vn")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("Cư Dân Hồ Test")
                .role(Role.RESIDENT)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
        residentUser = userRepository.save(residentUser);

        // Tạo người dùng mẫu Technician
        technicianUser = User.builder()
                .phoneNumber("0902000099")
                .email("tech.test@building.vn")
                .passwordHash(passwordEncoder.encode("123456"))
                .fullName("Thợ Kỹ Thuật Test")
                .role(Role.TECHNICIAN)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
        technicianUser = userRepository.save(technicianUser);

        // Căn hộ 1: Đã có cư dân ở (OCCUPIED)
        apt1 = Apartment.builder()
                .roomNumber("TEST-101")
                .floor(1)
                .buildingBlock("Tòa A")
                .areaSqm(new BigDecimal("70.00"))
                .status(ApartmentStatus.OCCUPIED)
                .resident(residentUser)
                .updatedAt(LocalDateTime.now())
                .build();
        apt1 = apartmentRepository.save(apt1);

        // Căn hộ 2: Đang trống (VACANT)
        apt2 = Apartment.builder()
                .roomNumber("TEST-202")
                .floor(2)
                .buildingBlock("Tòa B")
                .areaSqm(new BigDecimal("85.50"))
                .status(ApartmentStatus.VACANT)
                .resident(null)
                .updatedAt(LocalDateTime.now())
                .build();
        apt2 = apartmentRepository.save(apt2);
    }

    // =========================================================================
    // PHÂN HỆ 1: XÁC THỰC & ĐIỀU HƯỚNG NGỮ CẢNH (UC-01 -> UC-03)
    // =========================================================================

    @Test
    @DisplayName("UC-01: Đăng nhập hệ thống (AuthService.login) - Thành công và thất bại")
    void testUC01_Login() {
        // Given: Thông tin đăng nhập đúng
        LoginRequest validReq = LoginRequest.builder()
                .phoneNumber("0901000099")
                .password("123456")
                .build();

        // When
        AuthResponse response = authService.login(validReq);

        // Then
        assertNotNull(response.getToken());
        assertEquals("BQL Test Admin", response.getUser().getFullName());
        assertEquals(Role.ADMIN, response.getUser().getRole());

        // When & Then: Sai mật khẩu
        LoginRequest invalidReq = LoginRequest.builder()
                .phoneNumber("0901000099")
                .password("wrongpassword")
                .build();
        assertThrows(AppException.class, () -> authService.login(invalidReq));
    }

    @Test
    @DisplayName("UC-02: Đổi mật khẩu tài khoản (AuthService.changePassword) & Kiểm tra bảo mật")
    void testUC02_UserPasswordAndStatus() {
        assertTrue(residentUser.getIsActive());
        assertTrue(passwordEncoder.matches("123456", residentUser.getPasswordHash()));

        // When: Đổi mật khẩu hợp lệ
        ChangePasswordRequest changeReq = ChangePasswordRequest.builder()
                .currentPassword("123456")
                .newPassword("newSecretPass@2026")
                .build();
        authService.changePassword(residentUser.getId(), changeReq);

        // Then: Mật khẩu mới khớp
        User updated = userRepository.findById(residentUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("newSecretPass@2026", updated.getPasswordHash()));
        assertFalse(passwordEncoder.matches("123456", updated.getPasswordHash()));

        // When: Thử đổi với mật khẩu hiện tại sai -> Phải ném ngoại lệ
        ChangePasswordRequest wrongReq = ChangePasswordRequest.builder()
                .currentPassword("wrongPassword")
                .newPassword("failPass@2026")
                .build();
        assertThrows(AppException.class, () -> authService.changePassword(residentUser.getId(), wrongReq));
    }

    @Test
    @DisplayName("UC-03: Chuyển đổi ngữ cảnh căn hộ cư dân (Context Switch - BR-02)")
    void testUC03_ContextSwitch() {
        // Given: Gán thêm căn hộ thứ 2 cho cùng 1 cư dân
        Apartment aptSecond = Apartment.builder()
                .roomNumber("TEST-303")
                .floor(3)
                .buildingBlock("Tòa A")
                .areaSqm(new BigDecimal("60.00"))
                .status(ApartmentStatus.OCCUPIED)
                .resident(residentUser)
                .updatedAt(LocalDateTime.now())
                .build();
        apartmentRepository.save(aptSecond);

        // When: Cư dân truy vấn danh sách căn hộ của mình
        List<ApartmentResponse> residentApartments = apartmentService.getApartmentsByResident(residentUser.getId());

        // Then: Cư dân nhận được đúng 2 căn hộ đang OCCUPIED để đổi trên Dropdown
        assertEquals(2, residentApartments.size());
        assertTrue(residentApartments.stream().anyMatch(a -> a.getRoomNumber().equals("TEST-101")));
        assertTrue(residentApartments.stream().anyMatch(a -> a.getRoomNumber().equals("TEST-303")));
    }

    // =========================================================================
    // PHÂN HỆ 2: QUẢN LÝ CĂN HỘ, CƯ DÂN & PHƯƠNG TIỆN (UC-04 -> UC-07)
    // =========================================================================

    @Test
    @DisplayName("UC-04: Quản lý danh mục căn hộ (CRUD Apartment & Lọc động)")
    void testUC04_CRUD_Apartment() {
        // Given: Tạo mới căn hộ
        ApartmentRequest req = ApartmentRequest.builder()
                .roomNumber("TEST-CRUD-404")
                .floor(4)
                .buildingBlock("Tòa C")
                .areaSqm(new BigDecimal("95.00"))
                .build();

        // When
        ApartmentResponse created = apartmentService.createApartment(req);

        // Then
        assertNotNull(created.getId());
        assertEquals("TEST-CRUD-404", created.getRoomNumber());
        assertEquals(ApartmentStatus.VACANT, created.getStatus());

        // Lọc động theo tiêu chí
        List<ApartmentResponse> filtered = apartmentService.searchApartments("Tòa C", 4, ApartmentStatus.VACANT, null, null, null);
        assertEquals(1, filtered.size());
        assertEquals("TEST-CRUD-404", filtered.get(0).getRoomNumber());
    }

    @Test
    @DisplayName("UC-05: Tiếp nhận cư dân vào ở (Move-in - BR-03)")
    void testUC05_MoveIn() {
        // Given: Căn hộ apt2 đang VACANT
        assertEquals(ApartmentStatus.VACANT, apt2.getStatus());

        MoveInRequest moveInReq = MoveInRequest.builder()
                .fullName("Cư Dân Mới Đến")
                .phoneNumber("0977889900")
                .email("new.resident@building.vn")
                .build();

        // When: Thực hiện Move-in
        ApartmentResponse res = apartmentService.moveIn(apt2.getId(), moveInReq);

        // Then: Căn hộ chuyển sang OCCUPIED, tài khoản user mới được tạo
        assertEquals(ApartmentStatus.OCCUPIED, res.getStatus());
        assertNotNull(res.getResident());
        assertEquals("Cư Dân Mới Đến", res.getResident().getFullName());

        User newUser = userRepository.findByPhoneNumber("0977889900").orElse(null);
        assertNotNull(newUser);
        assertEquals(Role.RESIDENT, newUser.getRole());
        assertTrue(newUser.getIsActive());
    }

    @Test
    @DisplayName("UC-06: Chặn dọn đi khi nợ & Bàn giao trả phòng thành công (Move-out - BR-04)")
    void testUC06_MoveOut() {
        // Case 1: Chặn nợ khi có hóa đơn UNPAID
        Invoice unpaidInv = Invoice.builder()
                .invoiceCode("INV-TEST-DEBT")
                .apartment(apt1)
                .billingMonth("2026-10")
                .oldElectricNum(0).newElectricNum(50)
                .oldWaterNum(0).newWaterNum(10)
                .totalAmount(new BigDecimal("500000.00"))
                .status(InvoiceStatus.UNPAID)
                .dueDate(LocalDate.now().plusDays(10))
                .createdAt(LocalDateTime.now())
                .build();
        invoiceRepository.save(unpaidInv);

        // When & Then: Phải ném ngoại lệ chặn dọn đi
        AppException ex = assertThrows(AppException.class, () -> apartmentService.moveOut(apt1.getId()));
        assertTrue(ex.getMessage().contains("chưa thanh toán"));

        // Case 2: Thanh toán xong (xóa hóa đơn nợ) -> Move-out thành công
        invoiceRepository.delete(unpaidInv);

        ApartmentResponse vacated = apartmentService.moveOut(apt1.getId());
        assertEquals(ApartmentStatus.VACANT, vacated.getStatus());
        assertNull(vacated.getResident());
        assertEquals(0, vehicleRepository.findByApartmentId(apt1.getId()).size());

        // Then: Cư dân không còn căn hộ OCCUPIED nào -> Tài khoản bị soft-disable (is_active = false)
        User residentAfterMoveOut = userRepository.findById(residentUser.getId()).orElseThrow();
        assertFalse(residentAfterMoveOut.getIsActive());
    }

    @Test
    @DisplayName("UC-07: Quản lý phương tiện đăng ký theo căn hộ (Vehicles)")
    void testUC07_VehicleManagement() {
        // Given: Đăng ký xe máy và ô tô cho căn hộ apt1
        VehicleRequest reqMoto = VehicleRequest.builder()
                .licensePlate("29A-123.45")
                .vehicleType(VehicleType.MOTORBIKE)
                .ownerName("Hồ Test")
                .build();
        VehicleResponse motoRes = apartmentService.addVehicle(apt1.getId(), reqMoto);
        assertNotNull(motoRes.getId());

        VehicleRequest reqCar = VehicleRequest.builder()
                .licensePlate("30E-999.99")
                .vehicleType(VehicleType.CAR)
                .ownerName("Hồ Test")
                .build();
        apartmentService.addVehicle(apt1.getId(), reqCar);

        // When: Lấy danh sách xe
        List<VehicleResponse> vehicles = apartmentService.getVehiclesByApartment(apt1.getId());

        // Then: Có 2 xe
        assertEquals(2, vehicles.size());

        // Xóa xe máy
        apartmentService.deleteVehicle(apt1.getId(), motoRes.getId());
        assertEquals(1, apartmentService.getVehiclesByApartment(apt1.getId()).size());
    }

    // =========================================================================
    // PHÂN HỆ 3: BIỂU PHÍ, HÓA ĐƠN & GẠCH NỢ (UC-08 -> UC-12)
    // =========================================================================

    @Test
    @DisplayName("UC-08: Cấu hình và cập nhật bảng giá dịch vụ tòa nhà")
    void testUC08_TariffConfig() {
        // Given: Cập nhật đơn giá mới
        TariffRequest req = TariffRequest.builder()
                .managementFeePerSqm(new BigDecimal("12000.00"))
                .electricityUnitPrice(new BigDecimal("4000.00"))
                .waterUnitPrice(new BigDecimal("18000.00"))
                .motorbikeFee(new BigDecimal("120000.00"))
                .carFee(new BigDecimal("1500000.00"))
                .build();

        // When
        TariffResponse updated = billingService.updateTariff(req);

        // Then
        assertEquals(new BigDecimal("12000.00"), updated.getManagementFeePerSqm());
        assertEquals(new BigDecimal("4000.00"), updated.getElectricityUnitPrice());
    }

    @Test
    @DisplayName("UC-09: Chốt số & Xuất hóa đơn hàng loạt (BR-05: tính toán chuẩn 5 thành phần)")
    void testUC09_BatchGenerateInvoices() {
        // Given: Đăng ký 1 xe máy cho apt1 (70m2)
        apartmentService.addVehicle(apt1.getId(), VehicleRequest.builder()
                .licensePlate("29-B1-0001")
                .vehicleType(VehicleType.MOTORBIKE)
                .ownerName("Hồ Test")
                .build());

        // Căn apt1: cũ (E:0, W:0) -> mới (E:100, W:20)
        // Căn apt2: đang VACANT -> kiểm tra không được tạo
        MeterReadingItem item1 = MeterReadingItem.builder()
                .apartmentId(apt1.getId())
                .oldElectricNum(0).newElectricNum(100)
                .oldWaterNum(0).newWaterNum(20)
                .build();

        BatchInvoiceCreateRequest batchReq = BatchInvoiceCreateRequest.builder()
                .billingMonth("2026-11")
                .dueDate(LocalDate.now().plusDays(15))
                .readings(List.of(item1))
                .build();

        // When
        List<InvoiceResponse> createdInvoices = billingService.batchGenerateInvoices(batchReq);

        // Then: 1 hóa đơn được tạo cho apt1
        assertEquals(1, createdInvoices.size());
        InvoiceResponse inv = createdInvoices.get(0);
        assertEquals(InvoiceStatus.UNPAID, inv.getStatus());
        assertTrue(inv.getInvoiceCode().startsWith("INV-202611-"));

        // BR-05 Tính toán:
        // Phí QL = 70 * 10,000 = 700,000
        // Điện = 100 * 3,500 = 350,000
        // Nước = 20 * 15,000 = 300,000
        // Xe máy = 1 * 100,000 = 100,000
        // Tổng = 700k + 350k + 300k + 100k = 1,450,000
        assertEquals(0, new BigDecimal("1450000.00").compareTo(inv.getTotalAmount()));
    }

    @Test
    @DisplayName("UC-10: Cư dân xem danh sách & Chi tiết hóa đơn (Breakdown)")
    void testUC10_ViewResidentInvoices() {
        // Given: Tạo hóa đơn tháng 11 cho apt1
        testUC09_BatchGenerateInvoices();

        // When: Cư dân xem hóa đơn theo apartmentId
        List<InvoiceResponse> list = billingService.getInvoicesByApartment(apt1.getId());

        // Then
        assertFalse(list.isEmpty());
        InvoiceResponse res = list.get(0);
        assertNotNull(res.getBreakdown());
        assertEquals(100, res.getBreakdown().getElectricUsage());
        assertEquals(20, res.getBreakdown().getWaterUsage());
    }

    @Test
    @DisplayName("UC-11: Cư dân quét VietQR và bấm xác nhận đã chuyển khoản (BR-06: UNPAID -> PENDING)")
    void testUC11_ConfirmPayment() {
        // Given: Có hóa đơn UNPAID
        testUC09_BatchGenerateInvoices();
        Invoice invoice = invoiceRepository.findByApartmentIdOrderByBillingMonthDesc(apt1.getId()).get(0);
        assertEquals(InvoiceStatus.UNPAID, invoice.getStatus());

        // When: Cư dân xác nhận đã chuyển khoản
        InvoiceResponse confirmed = billingService.confirmPayment(invoice.getId(), residentUser.getId());

        // Then: Trạng thái chuyển sang PENDING chờ BQL đối soát
        assertEquals(InvoiceStatus.PENDING, confirmed.getStatus());
    }

    @Test
    @DisplayName("UC-12: BQL đối soát sao kê ngân hàng & Gạch nợ (BR-06: Approve -> PAID / Reject -> UNPAID)")
    void testUC12_Reconciliation() {
        // Given: Hóa đơn đang PENDING
        testUC11_ConfirmPayment();
        Invoice invoice = invoiceRepository.findByApartmentIdOrderByBillingMonthDesc(apt1.getId()).get(0);

        // Case 1: Từ chối (chưa nhận được tiền) -> quay về UNPAID
        InvoiceResponse rejected = billingService.rejectInvoice(invoice.getId());
        assertEquals(InvoiceStatus.UNPAID, rejected.getStatus());

        // Chuyển lại sang PENDING
        billingService.confirmPayment(invoice.getId(), residentUser.getId());

        // Case 2: Duyệt thành công (tiền đã khớp sao kê) -> chuyển sang PAID
        InvoiceResponse approved = billingService.approveInvoice(invoice.getId(), adminUser.getId());
        assertEquals(InvoiceStatus.PAID, approved.getStatus());
        assertNotNull(approved.getPaidAt());
        assertEquals(adminUser.getFullName(), approved.getApprovedByName());
    }

    // =========================================================================
    // PHÂN HỆ 4: SỰ CỐ & CHỢ VIỆC KỸ THUẬT (UC-13 -> UC-18)
    // =========================================================================

    @Test
    @DisplayName("UC-13: Cư dân tạo phiếu báo hỏng sự cố căn hộ")
    void testUC13_CreateTicket() {
        // Given
        TicketCreateRequest req = TicketCreateRequest.builder()
                .apartmentId(apt1.getId())
                .category(TicketCategory.PLUMBING)
                .title("Rò rỉ ống nước bồn rửa bát")
                .description("Nước chảy nhỏ giọt liên tục dưới gầm tủ bếp")
                .imageUrl("https://example.com/water-leak.jpg")
                .build();

        // When
        TicketResponse ticket = ticketService.createTicket(req, residentUser.getId());

        // Then
        assertNotNull(ticket.getId());
        assertTrue(ticket.getTicketCode().startsWith("TCK-"));
        assertEquals(TicketStatus.OPEN, ticket.getStatus());
        assertEquals("Rò rỉ ống nước bồn rửa bát", ticket.getTitle());
    }

    @Test
    @DisplayName("UC-14: Kỹ thuật viên xem danh sách sự cố chờ nhận (Task Pool)")
    void testUC14_ViewTaskPool() {
        // Given: Tạo sự cố mới
        testUC13_CreateTicket();

        // When: Thợ lấy danh sách Task Pool
        List<TicketResponse> pool = ticketService.getOpenTickets();

        // Then: Danh sách chứa ticket OPEN
        assertFalse(pool.isEmpty());
        assertTrue(pool.stream().anyMatch(t -> t.getStatus() == TicketStatus.OPEN));
    }

    @Test
    @DisplayName("UC-15: Nhận việc sửa chữa với Atomic Lock (BR-07: Claim ticket OPEN -> IN_PROGRESS)")
    void testUC15_ClaimTicket() {
        // Given: Có ticket OPEN
        testUC13_CreateTicket();
        Ticket openTicket = ticketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN).get(0);

        // When: Thợ kỹ thuật bấm nhận việc
        TicketResponse claimed = ticketService.claimTicket(openTicket.getId(), technicianUser.getId());

        // Then: Ticket chuyển sang IN_PROGRESS và gắn assignedTo
        assertEquals(TicketStatus.IN_PROGRESS, claimed.getStatus());
        assertEquals(technicianUser.getFullName(), claimed.getAssignedToName());

        // Chống Race Condition: Người thứ hai nhận việc cùng lúc sẽ ném ngoại lệ CONFLICT
        assertThrows(AppException.class, () -> ticketService.claimTicket(openTicket.getId(), technicianUser.getId()));
    }

    @Test
    @DisplayName("UC-16: Kỹ thuật viên báo hoàn thành công việc kèm biên bản xử lý (IN_PROGRESS -> RESOLVED)")
    void testUC16_ResolveTicket() {
        // Given: Thợ đã nhận việc (IN_PROGRESS)
        testUC15_ClaimTicket();
        Ticket inProgressTicket = ticketRepository.findByAssignedToIdOrderByCreatedAtDesc(technicianUser.getId()).get(0);

        TicketCompleteRequest completeReq = TicketCompleteRequest.builder()
                .technicianNote("Đã thay mới zoăng cao su và siết chặt cút nối ống nước")
                .build();

        // When: Báo hoàn thành
        TicketResponse resolved = ticketService.completeTicket(inProgressTicket.getId(), completeReq, technicianUser.getId());

        // Then: Chuyển sang RESOLVED chờ nghiệm thu
        assertEquals(TicketStatus.RESOLVED, resolved.getStatus());
        assertEquals("Đã thay mới zoăng cao su và siết chặt cút nối ống nước", resolved.getTechnicianNote());
        assertNotNull(resolved.getResolvedAt());
    }

    @Test
    @DisplayName("UC-17: Cư dân nghiệm thu đánh giá 5 sao hoặc yêu cầu làm lại (RESOLVED -> CLOSED hoặc IN_PROGRESS)")
    void testUC17_InspectAndRateTicket() {
        // Given: Ticket đã hoàn thành (RESOLVED)
        testUC16_ResolveTicket();
        Ticket resolvedTicket = ticketRepository.findAll().stream()
                .filter(t -> t.getStatus() == TicketStatus.RESOLVED)
                .findFirst().orElseThrow();

        // Case 1: Nghiệm thu hài lòng & đánh giá 5 sao
        TicketRateRequest rateReq = TicketRateRequest.builder()
                .rating(5)
                .rework(false)
                .build();

        TicketResponse closed = ticketService.inspectTicket(resolvedTicket.getId(), rateReq, residentUser.getId());

        // Then: Ticket chuyển sang CLOSED
        assertEquals(TicketStatus.CLOSED, closed.getStatus());
        assertEquals(5, closed.getRating());
    }

    @Test
    @DisplayName("UC-18: Ban Quản Lý chỉ định thợ cưỡng bức cho sự cố (Force Assign)")
    void testUC18_ForceAssignTicket() {
        // Given: Có ticket OPEN
        testUC13_CreateTicket();
        Ticket openTicket = ticketRepository.findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN).get(0);

        // When: Admin chỉ định thợ xử lý
        TicketResponse forceAssigned = ticketService.forceAssignTicket(openTicket.getId(), technicianUser.getId());

        // Then: Chuyển sang IN_PROGRESS và gắn assignedTo cho thợ
        assertEquals(TicketStatus.IN_PROGRESS, forceAssigned.getStatus());
        assertEquals(technicianUser.getFullName(), forceAssigned.getAssignedToName());
    }

    // =========================================================================
    // PHÂN HỆ 5: TRUYỀN THÔNG & BẢNG TIN TÒA NHÀ (UC-19 -> UC-20)
    // =========================================================================

    @Test
    @DisplayName("UC-19: Đăng và Quản lý bản tin thông báo tòa nhà (Create, Update, Pin/Unpin)")
    void testUC19_ManageAnnouncements() {
        // Given: Tạo thông báo mới có ghim
        AnnouncementRequest req = AnnouncementRequest.builder()
                .title("Thông báo bảo trì hệ thống PCCC định kỳ")
                .content("BQL sẽ diễn tập PCCC vào sáng Thứ Bảy từ 8h00 đến 11h00.")
                .isPinned(true)
                .build();

        // When
        AnnouncementResponse created = announcementService.createAnnouncement(req, adminUser.getId());

        // Then
        assertNotNull(created.getId());
        assertTrue(created.getIsPinned());
        assertEquals("BQL Test Admin", created.getCreatedByName());

        // Cập nhật gỡ ghim
        req.setIsPinned(false);
        AnnouncementResponse updated = announcementService.updateAnnouncement(created.getId(), req);
        assertFalse(updated.getIsPinned());
    }

    @Test
    @DisplayName("UC-20: Cư dân xem bảng tin tòa nhà (Ưu tiên tin được ghim lên đầu)")
    void testUC20_ViewAnnouncements_PinnedPriority() {
        // Given: 1 tin thường và 1 tin ghim
        Announcement normalPost = Announcement.builder()
                .title("Thông báo nhặt được chìa khóa xe")
                .content("Cư dân đánh rơi liên hệ sảnh lễ tân")
                .createdBy(adminUser)
                .isPinned(false)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        announcementRepository.save(normalPost);

        Announcement pinnedPost = Announcement.builder()
                .title("[QUAN TRỌNG] Tạm dừng cung cấp nước sinh hoạt để sục rửa bể")
                .content("Cắt nước từ 22h00 tối nay đến 04h00 sáng mai")
                .createdBy(adminUser)
                .isPinned(true)
                .createdAt(LocalDateTime.now().minusHours(5))
                .build();
        announcementRepository.save(pinnedPost);

        // When: Lấy toàn bộ danh sách bản tin
        List<AnnouncementResponse> list = announcementService.getAllAnnouncements();

        // Then: Tin được ghim (isPinned = true) luôn nằm ở vị trí đầu tiên
        assertFalse(list.isEmpty());
        assertTrue(list.get(0).getIsPinned());
        assertEquals("[QUAN TRỌNG] Tạm dừng cung cấp nước sinh hoạt để sục rửa bể", list.get(0).getTitle());
    }
}
