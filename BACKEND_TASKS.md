# DANH SÁCH CHI TIẾT CÁC HẠNG MỤC CẦN CODE TRONG BACKEND (SPRING BOOT)
**Dự án:** Hệ thống Quản lý Vận hành Chung cư Đơn khối (Apartment BMS)  
**Tài liệu tham chiếu:** [ABMS_ProjectGuidelines.md](file:///e:/Springboot/SBA301_PC_ABMS/SBA301_PC_ABMS/ABMS_ProjectGuidelines.md) & [db/ApartmentDB.sql](file:///e:/Springboot/SBA301_PC_ABMS/SBA301_PC_ABMS/db/ApartmentDB.sql)  
**Kiến trúc:** N-Layer Architecture (Presentation $\rightarrow$ Business Logic $\rightarrow$ Data Access $\rightarrow$ Database + Cross-Cutting Concerns)  
**Package gốc:** `com.example.apartmentbs`

---

## 1. TỔNG QUAN KIẾN TRÚC & QUY TẮC KỸ THUẬT

1. **Mô hình N-Layer (3 Tầng chính + Tầng xuyên suốt):**
   * **Presentation Layer (`controller`):** Tiếp nhận HTTP Request, validate qua Bean Validation (`@Valid`), trả về `ResponseEntity<ApiResponse<T>>`.
   * **Business Logic Layer (`service` & `service.impl`):** Quản lý transaction (`@Transactional`), thực thi chặt chẽ 7 Business Rules (`BR-01` $\rightarrow$ `BR-07`).
   * **Data Access Layer (`repository` & `specification`):** Tương tác với MSSQL thông qua Spring Data JPA và JPA Specification cho lọc động.
   * **Cross-Cutting Layer (`config`, `exception`, `dto`):** Spring Security + Stateless JWT Token, CORS filter, Global Exception Handler.
2. **Chiến lược truy vấn CSDL:**
   * **Lọc động nhiều tiêu chí (Dynamic Filter):** Sử dụng `JpaSpecificationExecutor` và `ApartmentSpecification` (kế thừa Criteria API tinh gọn).
   * **Chống xung đột nhận việc (Atomic Claim Ticket):** Bắt buộc dùng `@Modifying @Query` để UPDATE nguyên tử có điều kiện `status = 'OPEN'`.
   * **CRUD & Tìm kiếm cơ bản:** Dùng Spring Data JPA Derived Query Methods (`findBy...`).

---

## 2. BẢNG CHECKLIST FILE CẦN CODE THEO TỪNG PACKAGE

### BƯỚC 0: HẠ TẦNG, CƠ SỞ DỮ LIỆU & BẢO MẬT (INFRASTRUCTURE & CONFIG)

- [ ] `pom.xml`: Sửa parent version về Spring Boot `3.4.2` (thay cho `4.1.2` không hợp lệ). Bổ sung 4 nhóm dependency:
  - `spring-boot-starter-web` (REST APIs)
  - `spring-boot-starter-validation` (`@NotNull`, `@NotBlank`, `@Min`, `@Size`)
  - `spring-boot-starter-security` (Security & BCrypt)
  - `io.jsonwebtoken:jjwt-api:0.12.6`, `jjwt-impl:0.12.6`, `jjwt-jackson:0.12.6` (JWT)
- [ ] `src/main/resources/application.properties`:
  - Cấu hình DataSource kết nối MSSQL `ApartmentDB` (`localhost:1433`).
  - Cấu hình Hibernate: `spring.jpa.hibernate.ddl-auto=none`, `spring.jpa.show-sql=true`, dialect MSSQL.
  - Cấu hình JWT: `jwt.secret` (chuỗi 256-bit an toàn), `jwt.expiration=86400000` (24 giờ).
- [ ] `config/CorsConfig.java`: Cho phép React Frontend (`http://localhost:5173`) truy cập API với đầy đủ các HTTP Methods (GET, POST, PUT, DELETE, OPTIONS).
- [ ] `config/JwtTokenProvider.java`:
  - Hàm `generateToken(User)`: Sinh token chứa Claims (`id`, `phoneNumber`, `fullName`, `role`).
  - Hàm `getUserIdFromToken(String token)`, `getRoleFromToken(String token)`.
  - Hàm `validateToken(String token)`: Kiểm tra tính hợp lệ và hạn dùng.
- [ ] `config/JwtAuthenticationFilter.java`: `OncePerRequestFilter` bóc tách `Authorization: Bearer <token>`, xác thực và nạp `UsernamePasswordAuthenticationToken` vào `SecurityContextHolder`.
- [ ] `config/SecurityConfig.java`:
  - Cấu hình `SecurityFilterChain`: Tắt CSRF (Stateless), bật CORS, cấu hình `SessionCreationPolicy.STATELESS`.
  - Khai báo Bean `PasswordEncoder` (`BCryptPasswordEncoder`).
  - Khai báo Bean `AuthenticationManager`.
  - Phân quyền Endpoints: Public `/api/v1/auth/login`, Admin `/api/v1/admin/**`, Resident `/api/v1/resident/**`, Technician `/api/v1/technician/**`.

---

### BƯỚC 1: PACKAGE `model` (7 JPA ENTITIES & ENUMS)

- [ ] `model/Role.java`: `ADMIN`, `RESIDENT`, `TECHNICIAN`.
- [ ] `model/ApartmentStatus.java`: `VACANT`, `OCCUPIED`.
- [ ] `model/VehicleType.java`: `MOTORBIKE`, `CAR`.
- [ ] `model/InvoiceStatus.java`: `UNPAID`, `PENDING`, `PAID`.
- [ ] `model/TicketStatus.java`: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- [ ] `model/TicketCategory.java`: `ELECTRIC`, `PLUMBING`, `OTHER`.
- [ ] `model/User.java` (Bảng `users`):
  - `id` (Long, PK Identity)
  - `phoneNumber` (String, Unique)
  - `email` (String, Unique)
  - `passwordHash` (String)
  - `fullName` (String)
  - `role` (EnumType.STRING)
  - `isActive` (Boolean, default true)
  - `createdAt` (LocalDateTime)
- [ ] `model/Apartment.java` (Bảng `apartments`):
  - `id` (Long, PK Identity)
  - `roomNumber` (String, Unique)
  - `floor` (Integer)
  - `buildingBlock` (String)
  - `areaSqm` (BigDecimal)
  - `status` (EnumType.STRING, default VACANT)
  - `resident` (`@ManyToOne` User, nullable)
  - `updatedAt` (LocalDateTime)
- [ ] `model/Vehicle.java` (Bảng `vehicles`):
  - `id` (Long, PK Identity)
  - `apartment` (`@ManyToOne` Apartment, Cascade on delete)
  - `licensePlate` (String, Unique)
  - `vehicleType` (EnumType.STRING)
  - `ownerName` (String)
  - `createdAt` (LocalDateTime)
- [ ] `model/ServiceTariff.java` (Bảng `service_tariffs`):
  - `id` (Integer, PK = 1)
  - `managementFeePerSqm` (BigDecimal)
  - `electricityUnitPrice` (BigDecimal)
  - `waterUnitPrice` (BigDecimal)
  - `motorbikeFee` (BigDecimal)
  - `carFee` (BigDecimal)
  - `updatedAt` (LocalDateTime)
- [ ] `model/Invoice.java` (Bảng `invoices`):
  - `id` (Long, PK Identity)
  - `invoiceCode` (String, Unique, format: `INV-YYYYMM-ROOM`)
  - `apartment` (`@ManyToOne` Apartment)
  - `billingMonth` (String, format: `YYYY-MM`)
  - `oldElectricNum` (Integer), `newElectricNum` (Integer)
  - `oldWaterNum` (Integer), `newWaterNum` (Integer)
  - `totalAmount` (BigDecimal)
  - `status` (EnumType.STRING, default UNPAID)
  - `dueDate` (LocalDate)
  - `paidAt` (LocalDateTime, nullable)
  - `approvedBy` (`@ManyToOne` User, nullable)
  - `createdAt` (LocalDateTime)
- [ ] `model/Ticket.java` (Bảng `tickets`):
  - `id` (Long, PK Identity)
  - `ticketCode` (String, Unique, format: `TCK-YYYYMM-SEQ`)
  - `apartment` (`@ManyToOne` Apartment)
  - `resident` (`@ManyToOne` User)
  - `category` (EnumType.STRING)
  - `title` (String), `description` (String), `imageUrl` (String)
  - `status` (EnumType.STRING, default OPEN)
  - `assignedTo` (`@ManyToOne` User, nullable)
  - `technicianNote` (String, nullable)
  - `rating` (Integer, 1-5, nullable)
  - `createdAt` (LocalDateTime), `resolvedAt` (LocalDateTime, nullable)
- [ ] `model/Announcement.java` (Bảng `announcements`):
  - `id` (Long, PK Identity)
  - `title` (String), `content` (String)
  - `createdBy` (`@ManyToOne` User)
  - `isPinned` (Boolean, default false)
  - `createdAt` (LocalDateTime)

---

### BƯỚC 2: PACKAGE `repository` & `specification` (DATA ACCESS)

- [ ] `repository/UserRepository.java`:
  - `Optional<User> findByPhoneNumber(String phoneNumber)`
  - `Optional<User> findByEmail(String email)`
  - `Optional<User> findByPhoneNumberOrEmail(String phone, String email)`
  - `boolean existsByPhoneNumber(String phoneNumber)`
  - `boolean existsByEmail(String email)`
- [ ] `repository/ApartmentRepository.java`:
  - Kế thừa: `JpaRepository<Apartment, Long>`, `JpaSpecificationExecutor<Apartment>`
  - `Optional<Apartment> findByRoomNumber(String roomNumber)`
  - `boolean existsByRoomNumber(String roomNumber)`
  - `List<Apartment> findByResidentIdAndStatus(Long residentId, ApartmentStatus status)`
  - `long countByResidentIdAndStatus(Long residentId, ApartmentStatus status)`
  - `List<Apartment> findByStatus(ApartmentStatus status)`
- [ ] `repository/specification/ApartmentSpecification.java`:
  - Lọc động theo: `roomNumber` (like), `floor` (equal), `buildingBlock` (equal), `status` (equal) dùng `CriteriaBuilder` và `Predicate`.
- [ ] `repository/VehicleRepository.java`:
  - `List<Vehicle> findByApartmentId(Long apartmentId)`
  - `boolean existsByLicensePlate(String licensePlate)`
  - `long countByApartmentIdAndVehicleType(Long apartmentId, VehicleType type)`
  - `void deleteByApartmentId(Long apartmentId)`
- [ ] `repository/ServiceTariffRepository.java`:
  - `default ServiceTariff getTariff()` $\rightarrow$ gọi `findById(1)`
- [ ] `repository/InvoiceRepository.java`:
  - `List<Invoice> findByApartmentIdOrderByBillingMonthDesc(Long apartmentId)`
  - `List<Invoice> findByApartmentIdAndStatusIn(Long apartmentId, Collection<InvoiceStatus> statuses)` (phục vụ `BR-04` chặn nợ khi Move-out)
  - `boolean existsByApartmentIdAndBillingMonth(Long apartmentId, String billingMonth)`
  - `Optional<Invoice> findTopByApartmentIdAndBillingMonthLessThanOrderByBillingMonthDesc(Long apartmentId, String billingMonth)` (lấy chỉ số cũ kỳ trước)
  - `List<Invoice> findByStatusOrderByCreatedAtDesc(InvoiceStatus status)`
- [ ] `repository/TicketRepository.java`:
  - `List<Ticket> findByStatusOrderByCreatedAtAsc(TicketStatus status)` (Task Pool)
  - `List<Ticket> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId)`
  - `List<Ticket> findByAssignedToIdAndStatusOrderByCreatedAtDesc(Long technicianId, TicketStatus status)`
  - `@Modifying @Query`: Atomic Claim Ticket chống race condition (`BR-07`):  
    `UPDATE Ticket t SET t.status = 'IN_PROGRESS', t.assignedTo = :technician WHERE t.id = :id AND t.status = 'OPEN'`
- [ ] `repository/AnnouncementRepository.java`:
  - `List<Announcement> findAllByOrderByIsPinnedDescCreatedAtDesc()`

---

### BƯỚC 3: PACKAGE `exception` & `dto`

#### 3.1. Package `exception`
- [ ] `exception/ResourceNotFoundException.java` (HTTP 404)
- [ ] `exception/BadRequestException.java` (HTTP 400)
- [ ] `exception/ConflictException.java` (HTTP 409 - trùng dữ liệu)
- [ ] `exception/DebtConflictException.java` (HTTP 400 - Chặn nợ Move-out kèm danh sách mã hóa đơn và số tiền nợ)
- [ ] `exception/TicketConflictException.java` (HTTP 409 - Thợ nhận việc đã bị người khác nhận trước)
- [ ] `exception/GlobalExceptionHandler.java`: `@RestControllerAdvice` bắt và chuẩn hóa toàn bộ lỗi về JSON chuẩn `ApiResponse`.

#### 3.2. Package `dto/response`
- [ ] `dto/response/ApiResponse.java`: Generic response `{ success, message, data, timestamp }`
- [ ] `dto/response/AuthResponse.java`: `{ token, user: { id, fullName, role, phoneNumber, email } }`
- [ ] `dto/response/ApartmentResponse.java`: Thông tin căn hộ, chủ hộ hiện tại, số lượng xe đã đăng ký.
- [ ] `dto/response/VehicleResponse.java`: Biển số, loại xe, tên chủ xe.
- [ ] `dto/response/TariffResponse.java`: 5 mức đơn giá hiện hành.
- [ ] `dto/response/MeterSheetResponse.java`: Dữ liệu căn hộ `OCCUPIED`, chỉ số cũ kỳ trước, số lượng xe để Admin nhập số.
- [ ] `dto/response/InvoiceResponse.java`: Chi tiết hóa đơn (điện, nước, phí QL, phí xe, tổng tiền, trạng thái, VietQR URL).
- [ ] `dto/response/TicketResponse.java`: Chi tiết ticket kèm cờ boolean `isOverdue24h` tự tính.
- [ ] `dto/response/AnnouncementResponse.java`: Tiêu đề, nội dung, cờ ghim, người tạo, ngày tạo.

#### 3.3. Package `dto/request`
- [ ] `dto/request/LoginRequest.java`: `username` (SĐT hoặc Email), `password`.
- [ ] `dto/request/ChangePasswordRequest.java`: `currentPassword`, `newPassword` ($\ge 6$ ký tự), `confirmPassword`.
- [ ] `dto/request/ApartmentCreateRequest.java`: `roomNumber`, `floor`, `buildingBlock`, `areaSqm`.
- [ ] `dto/request/MoveInRequest.java`: `phoneNumber`, `email`, `fullName`.
- [ ] `dto/request/VehicleCreateRequest.java`: `licensePlate`, `vehicleType`, `ownerName`.
- [ ] `dto/request/TariffUpdateRequest.java`: 5 đơn giá $\ge 0$.
- [ ] `dto/request/MeterReadingItemRequest.java`: `apartmentId`, `newElectricNum`, `newWaterNum`.
- [ ] `dto/request/BatchInvoiceRequest.java`: `billingMonth`, `dueDate`, `List<MeterReadingItemRequest> items`.
- [ ] `dto/request/ReconcileRequest.java`: `action` (`APPROVE` / `REJECT`).
- [ ] `dto/request/TicketCreateRequest.java`: `apartmentId`, `category`, `title`, `description`, `imageUrl`.
- [ ] `dto/request/TicketResolveRequest.java`: `technicianNote` (bắt buộc).
- [ ] `dto/request/TicketRateRequest.java`: `rating` (1-5), `isAccepted` (boolean).
- [ ] `dto/request/ForceAssignRequest.java`: `technicianId`.
- [ ] `dto/request/AnnouncementRequest.java`: `title`, `content`, `isPinned`.

---

### BƯỚC 4: PACKAGE `service` & `service/impl` (BUSINESS LOGIC LAYER)

- [ ] `service/AuthService.java` & `AuthServiceImpl.java`:
  - `AuthResponse login(LoginRequest request)` (UC-01)
  - `void changePassword(Long userId, ChangePasswordRequest request)` (UC-02)
- [ ] `service/ApartmentService.java` & `ApartmentServiceImpl.java`:
  - `Page<ApartmentResponse> searchApartments(String roomNumber, Integer floor, String block, ApartmentStatus status, Pageable pageable)` (UC-04)
  - `ApartmentResponse createApartment(ApartmentCreateRequest request)` (UC-04)
  - `ApartmentResponse moveIn(Long apartmentId, MoveInRequest request)` (**BR-03, UC-05**)
  - `void moveOut(Long apartmentId)` (**BR-04, UC-06** - Chặn nợ tuyệt đối nếu còn `UNPAID` hoặc `PENDING`)
  - `List<ApartmentResponse> getResidentApartments(Long residentId)` (**BR-02, UC-03** - Context Switch)
- [ ] `service/VehicleService.java` & `VehicleServiceImpl.java`:
  - `List<VehicleResponse> getVehiclesByApartment(Long apartmentId)` (UC-07)
  - `VehicleResponse addVehicle(Long apartmentId, VehicleCreateRequest request)` (UC-07)
  - `void deleteVehicle(Long vehicleId)` (UC-07)
- [ ] `service/TariffService.java` & `TariffServiceImpl.java`:
  - `TariffResponse getCurrentTariff()` (UC-08)
  - `TariffResponse updateTariff(TariffUpdateRequest request)` (UC-08)
- [ ] `service/BillingService.java` & `BillingServiceImpl.java`:
  - `List<MeterSheetResponse> getMeterSheet(String billingMonth)` (**BR-05, UC-09** - Chỉ lấy căn `OCCUPIED`)
  - `List<InvoiceResponse> generateBatchInvoices(BatchInvoiceRequest request)` (**BR-05, UC-09** - Validate $new \ge old$, tính 5 thành phần tiền)
  - `List<InvoiceResponse> getInvoicesByApartment(Long apartmentId)` (UC-10)
  - `InvoiceResponse confirmPayment(Long invoiceId)` (**BR-06, UC-11** - Chuyển sang `PENDING`)
  - `List<InvoiceResponse> getPendingInvoices()` (UC-12)
  - `InvoiceResponse reconcileInvoice(Long invoiceId, ReconcileRequest request, Long adminId)` (**BR-06, UC-12** - Gạch nợ `PAID` hoặc trả về `UNPAID`)
- [ ] `service/TicketService.java` & `TicketServiceImpl.java`:
  - `TicketResponse createTicket(TicketCreateRequest request, Long residentId)` (UC-13)
  - `List<TicketResponse> getResidentTickets(Long apartmentId)` (UC-13)
  - `List<TicketResponse> getTaskPool()` (**BR-07, UC-14** - Tính $\Delta t > 24\text{h}$ gắn cờ đỏ `isOverdue24h`)
  - `TicketResponse claimTicket(Long ticketId, Long technicianId)` (**BR-07, UC-15** - Atomic Lock chống tranh chấp)
  - `List<TicketResponse> getMyTasks(Long technicianId)` (UC-16)
  - `TicketResponse resolveTicket(Long ticketId, TicketResolveRequest request)` (UC-16)
  - `TicketResponse rateAndCloseTicket(Long ticketId, TicketRateRequest request)` (UC-17)
  - `List<TicketResponse> getAllTicketsForAdmin()` (UC-18)
  - `TicketResponse forceAssignTicket(Long ticketId, Long technicianId)` (UC-18 - Gán cưỡng bức thợ cho ticket quá 24h)
- [ ] `service/AnnouncementService.java` & `AnnouncementServiceImpl.java`:
  - `List<AnnouncementResponse> getAnnouncements()` (UC-20 - Ưu tiên tin ghim)
  - `AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId)` (UC-19)
  - `AnnouncementResponse togglePin(Long id)` (UC-19)
  - `void deleteAnnouncement(Long id)` (UC-19)

---

### BƯỚC 5: PACKAGE `controller` (REST CONTROLLERS)

- [ ] `controller/AuthController.java` (`/api/v1/auth`):
  - `POST /login`
  - `PUT /change-password`
- [ ] `controller/ApartmentController.java` (`/api/v1/apartments`):
  - `GET /` (Tìm kiếm phân trang theo filter)
  - `POST /` (Thêm căn hộ)
  - `POST /{id}/move-in`
  - `POST /{id}/move-out`
  - `GET /my-apartments` (Resident Context Switch)
- [ ] `controller/VehicleController.java` (`/api/v1/vehicles`):
  - `GET /apartment/{aptId}`
  - `POST /apartment/{aptId}`
  - `DELETE /{id}`
- [ ] `controller/TariffController.java` (`/api/v1/tariffs`):
  - `GET /`
  - `PUT /`
- [ ] `controller/InvoiceController.java` (`/api/v1/invoices`):
  - `GET /meter-sheet?month=YYYY-MM`
  - `POST /generate`
  - `GET /resident?apartmentId={id}`
  - `POST /{id}/confirm-payment`
  - `GET /pending`
  - `POST /{id}/reconcile`
- [ ] `controller/TicketController.java` (`/api/v1/tickets`):
  - `POST /` (Resident tạo ticket)
  - `GET /my-tickets?apartmentId={id}`
  - `GET /task-pool` (Technician xem Chợ việc)
  - `POST /{id}/claim` (Technician nhận việc)
  - `GET /my-tasks` (Technician xem việc mình)
  - `PUT /{id}/resolve` (Technician báo xong)
  - `PUT /{id}/rate` (Resident nghiệm thu)
  - `GET /admin/all` (Admin giám sát)
  - `POST /{id}/force-assign` (Admin gán thợ)
- [ ] `controller/AnnouncementController.java` (`/api/v1/announcements`):
  - `GET /`
  - `POST /`
  - `PUT /{id}/pin`
  - `DELETE /{id}`

---

## 3. THỨ TỰ THỰC THI (IMPLEMENTATION WORKFLOW)

Thực hiện tuần tự từ trên xuống dưới theo thứ tự:
$$\text{Bước 0} \longrightarrow \text{Bước 1} \longrightarrow \text{Bước 2} \longrightarrow \text{Bước 3} \longrightarrow \text{Bước 4} \longrightarrow \text{Bước 5} \longrightarrow \text{Bước 6 (Test)}$$

Mọi thay đổi cần đảm bảo:
* Compile thành công qua `./mvnw clean compile` không có lỗi.
* Toàn bộ mã lỗi và thông điệp trả về đồng bộ với tài liệu [ABMS_ProjectGuidelines.md](file:///e:/Springboot/SBA301_PC_ABMS/SBA301_PC_ABMS/ABMS_ProjectGuidelines.md).
