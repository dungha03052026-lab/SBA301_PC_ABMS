# BẢNG ÁNH XẠ 20 USE CASES VỚI CÁC CLASS VÀ HÀM TRONG HỆ THỐNG ABMS

## (Apartment Building Management System - Traceability Matrix)

> Tài liệu này liệt kê chi tiết kiến trúc cấu thành của **toàn bộ 20 Use Cases** trong hệ thống **ABMS**, bao gồm các lớp **Controller**, **Service Interface**, **Service Implementation**, **Repository**, **Model / DTO** ở tầng Backend (Spring Boot) cùng các **Component & Hàm xử lý** ở tầng Frontend (React).

---

## MỤC LỤC

- [Phân hệ 1: Xác thực & Điều hướng (Auth & Context)](#phân-hệ-1-xác-thực--điều-hướng-auth--context)
  - [UC-01: Đăng nhập hệ thống (Login)](#uc-01-đăng-nhập-hệ-thống-login)
  - [UC-02: Đổi mật khẩu cá nhân (Change Password)](#uc-02-đổi-mật-khẩu-cá-nhân-change-password)
  - [UC-03: Chuyển đổi căn hộ hiển thị (Context Switch Apartment)](#uc-03-chuyển-đổi-căn-hộ-hiển-thị-context-switch-apartment)
- [Phân hệ 2: Quản lý căn hộ, cư dân & phương tiện (Apartment & Resident)](#phân-hệ-2-quản-lý-căn-hộ-cư-dân--phương-tiện-apartment--resident)
  - [UC-04: Quản lý danh mục Căn hộ (CRUD Apartment)](#uc-04-quản-lý-danh-mục-căn-hộ-crud-apartment)
  - [UC-05: Tiếp nhận cư dân mới & Tạo tài khoản (Move-in)](#uc-05-tiếp-nhận-cư-dân-mới--tạo-tài-khoản-move-in)
  - [UC-06: Bàn giao chuyển đi & Khóa tài khoản (Move-out)](#uc-06-bàn-giao-chuyển-đi--khóa-tài-khoản-move-out)
  - [UC-07: Quản lý phương tiện đăng ký theo căn hộ (Vehicle Management)](#uc-07-quản-lý-phương-tiện-đăng-ký-theo-căn-hộ-vehicle-management)
- [Phân hệ 3: Hóa đơn, VietQR & Đối soát gạch nợ (Billing & Payment)](#phân-hệ-3-hóa-đơn-vietqr--đối-soát-gạch-nợ-billing--payment)
  - [UC-08: Cấu hình bảng giá dịch vụ tòa nhà (Configure Service Tariffs)](#uc-08-cấu-hình-bảng-giá-dịch-vụ-tòa-nhà-configure-service-tariffs)
  - [UC-09: Nhập chỉ số điện nước & Xuất hóa đơn tháng (Meter Reading & Batch Invoice)](#uc-09-nhập-chỉ-số-điện-nước--xuất-hóa-đơn-tháng-meter-reading--batch-invoice)
  - [UC-10: Xem danh sách & Chi tiết hóa đơn căn hộ (View Resident Invoices)](#uc-10-xem-danh-sách--chi-tiết-hóa-đơn-căn-hộ-view-resident-invoices)
  - [UC-11: Quét VietQR & Báo đã chuyển khoản (Scan VietQR & Confirm Payment)](#uc-11-quét-vietqr--báo-đã-chuyển-khoản-scan-vietqr--confirm-payment)
  - [UC-12: Đối soát sao kê & Gạch nợ thủ công (Manual Payment Reconciliation)](#uc-12-đối-soát-sao-kê--gạch-nợ-thủ-công-manual-payment-reconciliation)
- [Phân hệ 4: Sự cố & Chợ việc kỹ thuật (Helpdesk & Task Pool)](#phân-hệ-4-sự-cố--chợ-việc-kỹ-thuật-helpdesk--task-pool)
  - [UC-13: Tạo phiếu báo hỏng/sự cố căn hộ (Create Maintenance Ticket)](#uc-13-tạo-phiếu-báo-hỏngsự-cố-căn-hộ-create-maintenance-ticket)
  - [UC-14: Xem danh sách sự cố chờ nhận & Cảnh báo quá 24h (View Task Pool)](#uc-14-xem-danh-sách-sự-cố-chờ-nhận--cảnh-báo-quá-24h-view-task-pool)
  - [UC-15: Nhận việc sửa chữa từ Task Pool (Claim Ticket - Atomic Lock)](#uc-15-nhận-việc-sửa-chữa-từ-task-pool-claim-ticket---atomic-lock)
  - [UC-16: Cập nhật tiến độ & Báo hoàn thành công việc (Resolve Ticket)](#uc-16-cập-nhật-tiến-độ--báo-hoàn-thành-công-việc-resolve-ticket)
  - [UC-17: Nghiệm thu hoàn thành & Đánh giá chất lượng 1–5 sao (Rate & Close Ticket)](#uc-17-nghiệm-thu-hoàn-thành--đánh-giá-chất-lượng-15-sao-rate--close-ticket)
  - [UC-18: Giám sát & Điều phối cưỡng bức sự cố tồn đọng quá 24h (Force Assign)](#uc-18-giám-sát--điều-phối-cưỡng-bức-sự-cố-tồn-đọng-quá-24h-force-assign)
- [Phân hệ 5: Truyền thông & Bảng tin tòa nhà (Announcements)](#phân-hệ-5-truyền-thông--bảng-tin-tòa-nhà-announcements)
  - [UC-19: Đăng và Quản lý bản tin thông báo tòa nhà (Manage Announcements)](#uc-19-đăng-và-quản-lý-bản-tin-thông-báo-tòa-nhà-manage-announcements)
  - [UC-20: Xem danh sách & Chi tiết thông báo tòa nhà (View Announcements)](#uc-20-xem-danh-sách--chi-tiết-thông-báo-tòa-nhà-view-announcements)
- [Ma trận tổng hợp phân bổ (Master Traceability Matrix)](#ma-trận-tổng-hợp-phân-bổ-master-traceability-matrix)

---

# PHÂN HỆ 1: XÁC THỰC & ĐIỀU HƯỚNG (AUTH & CONTEXT)

---

### UC-01: Đăng nhập hệ thống (Login)

- **Tác nhân (Actor):** `ADMIN`, `RESIDENT`, `TECHNICIAN`.
- **Mục đích nghiệp vụ:** Xác thực danh tính qua SĐT/Email và Mật khẩu; kiểm tra tài khoản còn hoạt động (`isActive = 1`); mã hóa/so khớp BCrypt; cấp phát JWT Token và điều hướng người dùng theo quyền hạn tương ứng.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.AuthController`
    - `public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request)`
    - Endpoint: `POST /api/v1/auth/login`
  - **Service Interface:** `com.example.apartmentbs.service.AuthService`
    - `AuthResponse login(LoginRequest request)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.AuthServiceImpl`
    - `public AuthResponse login(LoginRequest request)`: Tìm kiếm user theo số điện thoại, kiểm tra cờ `isActive`, dùng `PasswordEncoder` so khớp hash mật khẩu, kích hoạt cập nhật BCrypt nếu là mật khẩu mặc định khởi tạo, gọi `JwtTokenProvider` để sinh token.
  - **Repository:** `com.example.apartmentbs.repository.UserRepository`
    - `Optional<User> findByPhoneNumber(String phoneNumber)`
    - `User save(User user)`
  - **Security & Providers:**
    - `com.example.apartmentbs.config.JwtTokenProvider`: `generateToken(User user)`
    - `org.springframework.security.crypto.password.PasswordEncoder`: `matches(...)`, `encode(...)`
  - **DTOs & Models:**
    - Request: `LoginRequest` (fields: `phoneNumber`, `password`)
    - Response: `AuthResponse` (`token`, `tokenType`, `user`), `UserResponse`, `ApiResponse<AuthResponse>`
    - Model: `User`, `Role`
- **Frontend:**
  - **Component:** `src/modules/auth/LoginPage.jsx`
    - `handleSubmit`: Gửi form SĐT & mật khẩu tới API auth.
    - `handleMockLogin`: Hỗ trợ đăng nhập nhanh phục vụ việc kiểm thử 3 vai trò.
  - **Context / API:**
    - `src/shared/context/AuthContext.jsx`: `login(credentials)`, `mockLogin(role)`
    - `src/shared/api/axiosClient.js`: Đính kèm Bearer token vào HTTP Headers.

---

### UC-02: Đổi mật khẩu cá nhân (Change Password)

- **Tác nhân (Actor):** `ADMIN`, `RESIDENT`, `TECHNICIAN`.
- **Mục đích nghiệp vụ:** Cho phép người dùng đang đăng nhập chủ động thay đổi mật khẩu định kỳ để tăng cường bảo mật. Kiểm tra mật khẩu hiện tại, độ dài mật khẩu mới ($\ge 6$ ký tự) và trùng khớp mật khẩu xác nhận.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.AuthController`
    - `public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request)`
    - Endpoint: `PUT /api/v1/auth/change-password`
  - **Service Interface:** `com.example.apartmentbs.service.AuthService`
    - `void changePassword(Long userId, ChangePasswordRequest request)`
    - `User getAuthenticatedUser()`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.AuthServiceImpl`
    - `public void changePassword(Long userId, ChangePasswordRequest request)`: Tìm người dùng, kiểm tra mật khẩu hiện tại bằng `passwordEncoder.matches`, băm mật khẩu mới bằng BCrypt và lưu vào DB.
    - `public User getAuthenticatedUser()`: Lấy thông tin user hiện tại từ `SecurityContextHolder`.
  - **Repository:** `com.example.apartmentbs.repository.UserRepository`
    - `Optional<User> findById(Long id)`
    - `User save(User user)`
  - **DTOs & Models:**
    - Request: `ChangePasswordRequest` (fields: `currentPassword`, `newPassword`, `confirmPassword`)
    - Response: `ApiResponse<Void>`
    - Model: `User`
- **Frontend:**
  - **Component:** `src/shared/components/ChangePasswordModal.jsx` (Modal đổi mật khẩu được nhúng tại thanh Header của cả 3 layout).
    - `handleOk`: Validate dữ liệu form, kiểm tra `newPassword === confirmPassword`.
  - **Context:** `src/shared/context/AuthContext.jsx`: `changePassword(passwords)`

---

### UC-03: Chuyển đổi căn hộ hiển thị (Context Switch Apartment)

- **Tác nhân (Actor):** `RESIDENT`.
- **Mục đích nghiệp vụ:** Đáp ứng quy tắc nghiệp vụ `BR-02`: Một cư dân có thể đứng tên đại diện cho nhiều căn hộ. Cho phép cư dân chuyển đổi ngữ cảnh căn hộ làm việc qua Dropdown trên Header; các màn hình Hóa đơn và Báo hỏng sẽ tự động cập nhật và lọc theo căn hộ đang chọn.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.ResidentApartmentController`
    - `public ResponseEntity<ApiResponse<List<ApartmentResponse>>> getMyApartments()`
    - Endpoint: `GET /api/v1/resident/apartments`
  - **Service Interface:** `com.example.apartmentbs.service.ApartmentService`
    - `List<ApartmentResponse> getApartmentsByResident(Long residentId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.ApartmentServiceImpl`
    - `public List<ApartmentResponse> getApartmentsByResident(Long residentId)`: Lấy toàn bộ danh sách căn hộ mà cư dân đang đứng tên, kết hợp đếm số lượng phương tiện gắn với từng căn qua `vehicleRepository`.
  - **Repository:**
    - `com.example.apartmentbs.repository.ApartmentRepository`: `findByResidentId(Long residentId)`
    - `com.example.apartmentbs.repository.VehicleRepository`: `findByApartmentId(Long apartmentId)`
  - **DTOs & Models:**
    - Response: `ApartmentResponse`, `ApiResponse<List<ApartmentResponse>>`
    - Model: `Apartment`, `Vehicle`, `User`
- **Frontend:**
  - **Context:** `src/shared/context/ApartmentContext.jsx`
    - Quản lý trạng thái `apartments`, `selectedApartmentId`, `selectedApartment`, `setSelectedApartmentId`.
    - Tự động đặt căn đầu tiên làm căn mặc định khi vừa đăng nhập.
  - **Layout & Consumer Components:**
    - `src/shared/layouts/ResidentLayout.jsx`: Dropdown `<Select />` hiển thị danh sách phòng (ví dụ `A-101 (Tòa A)`).
    - `src/modules/resident/MyInvoices.jsx` & `src/modules/resident/ReportTicket.jsx`: Tự động re-fetch và lọc theo `selectedApartmentId`.

---

# PHÂN HỆ 2: QUẢN LÝ CĂN HỘ, CƯ DÂN & PHƯƠNG TIỆN (APARTMENT & RESIDENT)

---

### UC-04: Quản lý danh mục Căn hộ (CRUD Apartment)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Cho phép ban quản lý tra cứu phân trang, lọc nâng cao (khối nhà, tầng, diện tích, trạng thái trống/đang ở); thêm mới căn hộ (ràng buộc duy nhất số phòng); sửa thông tin diện tích/tầng; và xóa căn hộ đang trống.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.ApartmentController`
    - `searchApartmentsPaged(...)` $\rightarrow$ `GET /api/v1/admin/apartments`
    - `getAllApartments(...)` $\rightarrow$ `GET /api/v1/admin/apartments/all`
    - `getApartmentById(@PathVariable Long id)` $\rightarrow$ `GET /api/v1/admin/apartments/{id}`
    - `createApartment(@Valid @RequestBody ApartmentRequest request)` $\rightarrow$ `POST /api/v1/admin/apartments`
    - `updateApartment(@PathVariable Long id, @Valid @RequestBody ApartmentRequest request)` $\rightarrow$ `PUT /api/v1/admin/apartments/{id}`
    - `deleteApartment(@PathVariable Long id)` $\rightarrow$ `DELETE /api/v1/admin/apartments/{id}`
  - **Service Interface:** `com.example.apartmentbs.service.ApartmentService`
    - `PageResponse<ApartmentResponse> searchApartmentsPaged(...)`
    - `List<ApartmentResponse> searchApartments(...)`
    - `ApartmentResponse getApartmentById(Long id)`
    - `ApartmentResponse createApartment(ApartmentRequest request)`
    - `ApartmentResponse updateApartment(Long id, ApartmentRequest request)`
    - `void deleteApartment(Long id)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.ApartmentServiceImpl`
    - `searchApartmentsPaged`: Dùng `ApartmentSpecification` để sinh truy vấn JPA linh hoạt.
    - `createApartment`: Kiểm tra `existsByRoomNumber`, gán mặc định `ApartmentStatus.VACANT`.
    - `updateApartment`: Cập nhật các thông số phòng.
    - `deleteApartment`: Bắt buộc kiểm tra `status == OCCUPIED`, nếu đang có người ở thì chặn và báo lỗi nghiệp vụ.
  - **Repository & Specification:**
    - `com.example.apartmentbs.repository.ApartmentRepository`: `existsByRoomNumber`, `findAll(Specification, Pageable)`, `findById`, `save`, `delete`
    - `com.example.apartmentbs.repository.specification.ApartmentSpecification`: `filter(buildingBlock, floor, status, minArea, maxArea, search)`
  - **DTOs & Models:**
    - Request: `ApartmentRequest` (`roomNumber`, `floor`, `buildingBlock`, `areaSqm`)
    - Response: `ApartmentResponse`, `PageResponse<ApartmentResponse>`, `ApiResponse<...>`
    - Model: `Apartment`, `ApartmentStatus`
- **Frontend:**
  - **Component:** `src/modules/admin/ApartmentManagement.jsx`
    - `fetchApartments`: Tải danh sách căn hộ theo các tiêu chí tìm kiếm.
    - `handleCreateApartment`: Mở form thêm mới.
    - `handleEditApartment`: Mở form chỉnh sửa.
    - `handleDeleteApartment`: Xác nhận xóa căn hộ.

---

### UC-05: Tiếp nhận cư dân mới & Tạo tài khoản (Move-in)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Thực hiện thủ tục nhận phòng theo quy tắc `BR-03`. Nếu SĐT chưa có trong hệ thống thì tạo bản ghi mới trong bảng `users` với mật khẩu mặc định `123456`, quyền `RESIDENT`. Nếu SĐT đã có thì tái sử dụng tài khoản và kích hoạt `isActive = 1`. Cập nhật căn hộ sang `OCCUPIED`.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.ApartmentController`
    - `public ResponseEntity<ApiResponse<ApartmentResponse>> moveIn(@PathVariable Long id, @RequestBody MoveInRequest request)`
    - Endpoint: `POST /api/v1/admin/apartments/{id}/move-in`
    - `public ResponseEntity<ApiResponse<List<UserResponse>>> getResidents()` $\rightarrow$ `GET /api/v1/admin/users/residents`
  - **Service Interface:** `com.example.apartmentbs.service.ApartmentService`
    - `ApartmentResponse moveIn(Long id, MoveInRequest request)`
    - `List<UserResponse> getResidents()`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.ApartmentServiceImpl`
    - `public ApartmentResponse moveIn(Long id, MoveInRequest request)`: Kiểm tra căn hộ phải đang là `VACANT`. Xử lý tạo mới tài khoản User hoặc gán ID User đã tồn tại, cập nhật `apt.setResident(resident)` và `apt.setStatus(ApartmentStatus.OCCUPIED)`.
  - **Repository:**
    - `com.example.apartmentbs.repository.ApartmentRepository`: `findById`, `save`
    - `com.example.apartmentbs.repository.UserRepository`: `findById`, `existsByPhoneNumber`, `save`, `findByRole(Role.RESIDENT)`
  - **DTOs & Models:**
    - Request: `MoveInRequest` (`residentId`, `fullName`, `phoneNumber`, `email`)
    - Response: `ApartmentResponse`, `UserResponse`, `ApiResponse<ApartmentResponse>`
    - Model: `Apartment`, `User`, `Role`, `ApartmentStatus`
- **Frontend:**
  - **Component:** `src/modules/admin/ApartmentManagement.jsx`
    - `handleOpenMoveInModal`: Mở Modal Tiếp nhận cư dân.
    - `handleMoveInSubmit`: Validate và gửi payload Move-in lên server.

---

### UC-06: Bàn giao chuyển đi & Khóa tài khoản (Move-out)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Thực hiện quy tắc chặn nợ `BR-04`. Trước khi dọn đi, hệ thống kiểm tra toàn bộ hóa đơn của căn hộ; **nếu còn bất kỳ hóa đơn nào ở trạng thái `UNPAID` hoặc `PENDING`, hệ thống CHẶN CỨNG thao tác Move-out**. Khi nợ $= 0$: giải phóng phương tiện, chuyển căn về `VACANT`. Nếu cư dân không còn căn hộ nào khác, thực hiện vô hiệu hóa tài khoản (`isActive = 0`).
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.ApartmentController`
    - `public ResponseEntity<ApiResponse<ApartmentResponse>> moveOut(@PathVariable Long id)`
    - Endpoint: `POST /api/v1/admin/apartments/{id}/move-out`
  - **Service Interface:** `com.example.apartmentbs.service.ApartmentService`
    - `ApartmentResponse moveOut(Long id)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.ApartmentServiceImpl`
    - `public ApartmentResponse moveOut(Long id)`: Gọi `invoiceRepository.countByApartmentIdAndStatusIn(id, [UNPAID, PENDING])`. Nếu $> 0$, ném `AppException(HttpStatus.CONFLICT)`. Xóa xe qua `vehicleRepository.deleteByApartmentId(id)`. Cập nhật `resident = null`, `status = VACANT`. Đếm số căn còn lại của chủ cũ qua `countByResidentIdAndStatus`, nếu bằng 0 thì gán `oldResident.setIsActive(false)`.
  - **Repository:**
    - `com.example.apartmentbs.repository.InvoiceRepository`: `countByApartmentIdAndStatusIn(Long apartmentId, Collection<InvoiceStatus> statuses)`
    - `com.example.apartmentbs.repository.VehicleRepository`: `deleteByApartmentId(Long apartmentId)`
    - `com.example.apartmentbs.repository.ApartmentRepository`: `findById`, `save`, `countByResidentIdAndStatus(Long residentId, ApartmentStatus status)`
    - `com.example.apartmentbs.repository.UserRepository`: `save(User user)`
  - **DTOs & Models:**
    - Response: `ApartmentResponse`, `ApiResponse<ApartmentResponse>`
    - Model: `Apartment`, `Invoice`, `Vehicle`, `User`, `InvoiceStatus`, `ApartmentStatus`
- **Frontend:**
  - **Component:** `src/modules/admin/ApartmentManagement.jsx`
    - `handleMoveOut`: Gọi API dọn đi, hiển thị thông báo chặn nợ nếu vi phạm quy tắc `BR-04`.

---

### UC-07: Quản lý phương tiện đăng ký theo căn hộ (Vehicle Management)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Quản lý các xe máy và ô tô đăng ký gửi tại tòa nhà của từng căn hộ `OCCUPIED`. Ràng buộc biển số xe là duy nhất trong toàn hệ thống. Số lượng xe này là cơ sở trực tiếp để tính phí gửi xe trong hóa đơn hàng tháng.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.ApartmentController`
    - `getVehicles(@PathVariable Long id)` $\rightarrow$ `GET /api/v1/admin/apartments/{id}/vehicles`
    - `addVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest request)` $\rightarrow$ `POST /api/v1/admin/apartments/{id}/vehicles`
    - `deleteVehicle(@PathVariable Long id, @PathVariable Long vehicleId)` $\rightarrow$ `DELETE /api/v1/admin/apartments/{id}/vehicles/{vehicleId}`
  - **Service Interface:** `com.example.apartmentbs.service.ApartmentService`
    - `List<VehicleResponse> getVehiclesByApartment(Long apartmentId)`
    - `VehicleResponse addVehicle(Long apartmentId, VehicleRequest request)`
    - `void deleteVehicle(Long apartmentId, Long vehicleId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.ApartmentServiceImpl`
    - `getVehiclesByApartment`: Trả danh sách xe theo căn hộ.
    - `addVehicle`: Kiểm tra căn hộ đang có người ở, kiểm tra `vehicleRepository.existsByLicensePlate`, lưu bản ghi `Vehicle`.
    - `deleteVehicle`: Kiểm tra xe thuộc đúng căn hộ và xóa.
  - **Repository:** `com.example.apartmentbs.repository.VehicleRepository`
    - `findByApartmentId(Long apartmentId)`
    - `existsByLicensePlate(String licensePlate)`
    - `findById(Long id)`, `save(Vehicle vehicle)`, `delete(Vehicle vehicle)`
  - **DTOs & Models:**
    - Request: `VehicleRequest` (`licensePlate`, `vehicleType`, `ownerName`)
    - Response: `VehicleResponse`, `ApiResponse<VehicleResponse>`, `ApiResponse<List<VehicleResponse>>`
    - Model: `Vehicle`, `VehicleType`, `Apartment`
- **Frontend:**
  - **Component:** `src/modules/admin/ApartmentManagement.jsx`
    - `handleOpenVehicleModal`: Mở modal quản lý danh sách xe của căn hộ.
    - `handleAddVehicle`: Thêm xe máy hoặc ô tô mới.
    - `handleDeleteVehicle`: Hủy đăng ký phương tiện.

---

# PHÂN HỆ 3: HÓA ĐƠN, VIETQR & ĐỐI SOÁT GẠCH NỢ (BILLING & PAYMENT)

---

### UC-08: Cấu hình bảng giá dịch vụ tòa nhà (Configure Service Tariffs)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Quản lý dòng cấu hình đơn giá duy nhất (`id = 1`) trong bảng `service_tariffs`, gồm: phí quản lý/$m^2$, đơn giá điện, đơn giá nước, phí gửi xe máy, phí gửi ô tô.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.BillingController`
    - `getTariff()` $\rightarrow$ `GET /api/v1/tariffs`
    - `updateTariff(@Valid @RequestBody TariffRequest request)` $\rightarrow$ `PUT /api/v1/admin/tariffs`
  - **Service Interface:** `com.example.apartmentbs.service.BillingService`
    - `TariffResponse getTariff()`
    - `TariffResponse updateTariff(TariffRequest request)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.BillingServiceImpl`
    - `getTariff()` & `updateTariff(...)`: Đọc hoặc cập nhật dòng `id = 1`.
    - `getOrInitTariff()` (private helper): Khởi tạo đơn giá mặc định nếu DB chưa có dòng nào.
  - **Repository:** `com.example.apartmentbs.repository.ServiceTariffRepository`
    - `findById(1)`, `save(ServiceTariff tariff)`
  - **DTOs & Models:**
    - Request: `TariffRequest` (`managementFeePerSqm`, `electricityUnitPrice`, `waterUnitPrice`, `motorbikeFee`, `carFee`)
    - Response: `TariffResponse`, `ApiResponse<TariffResponse>`
    - Model: `ServiceTariff`
- **Frontend:**
  - **Component:** `src/modules/admin/MeterReading.jsx`
    - `fetchTariff`: Tải đơn giá hiện tại.
    - `handleSaveTariff`: Lưu cấu hình đơn giá mới.

---

### UC-09: Nhập chỉ số điện nước & Xuất hóa đơn tháng (Meter Reading & Batch Invoice)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Thực hiện quy tắc tính hóa đơn `BR-05`:
  - Chỉ quét các căn hộ `OCCUPIED`.
  - Lấy số cũ từ kỳ trước (nếu không có thì bằng 0).
  - Validate bắt buộc số mới $\ge$ số cũ.
  - Tự động tính: $\text{Tiền điện} + \text{Tiền nước} + \text{Phí quản lý} + \text{Phí xe}$.
  - Sinh mã `INV-YYYYMM-ROOM` và lưu hóa đơn trạng thái `UNPAID`.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.BillingController`
    - `public ResponseEntity<ApiResponse<List<InvoiceResponse>>> batchGenerateInvoices(@Valid @RequestBody BatchInvoiceCreateRequest request)`
    - Endpoint: `POST /api/v1/admin/invoices/batch-generate`
  - **Service Interface:** `com.example.apartmentbs.service.BillingService`
    - `List<InvoiceResponse> batchGenerateInvoices(BatchInvoiceCreateRequest request)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.BillingServiceImpl`
    - `public List<InvoiceResponse> batchGenerateInvoices(BatchInvoiceCreateRequest request)`: Duyệt từng chỉ số căn hộ, bỏ qua căn `VACANT`, tính tiền tiêu thụ, gọi `vehicleRepository` đếm số lượng xe máy/ô tô, tính tổng cộng `totalAmount`, lưu `Invoice` và trả về bảng kê chi tiết qua `enrichInvoiceResponse`.
  - **Repository:**
    - `com.example.apartmentbs.repository.ApartmentRepository`: `findById`
    - `com.example.apartmentbs.repository.VehicleRepository`: `countByApartmentIdAndVehicleType(Long apartmentId, VehicleType vehicleType)`
    - `com.example.apartmentbs.repository.InvoiceRepository`: `findByApartmentIdAndBillingMonth`, `save(Invoice invoice)`
    - `com.example.apartmentbs.repository.ServiceTariffRepository`: `findById(1)`
  - **DTOs & Models:**
    - Request: `BatchInvoiceCreateRequest`, `MeterReadingItem`
    - Response: `InvoiceResponse`, `InvoiceBreakdown`, `ApiResponse<List<InvoiceResponse>>`
    - Model: `Invoice`, `Apartment`, `Vehicle`, `ServiceTariff`, `InvoiceStatus`
- **Frontend:**
  - **Component:** `src/modules/admin/MeterReading.jsx`
    - `handleReadingChange`: Lắng nghe sự kiện gõ số mới, tự tính tổng tiền nhẩm tức thì trên bảng.
    - `handleBatchGenerateInvoices`: Gửi toàn bộ chỉ số để xuất hóa đơn hàng loạt.

---

### UC-10: Xem danh sách & Chi tiết hóa đơn căn hộ (View Resident Invoices)

- **Tác nhân (Actor):** `RESIDENT`.
- **Mục đích nghiệp vụ:** Cư dân xem các hóa đơn hàng tháng gắn liền với căn hộ đang chọn (`selectedApartmentId`). Hiển thị rõ các Tag trạng thái (`UNPAID`, `PENDING`, `PAID`) và Modal bảng kê chi tiết từng khoản thu.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.BillingController`
    - `getResidentInvoices(@RequestParam(required = false) Long apartmentId)` $\rightarrow$ `GET /api/v1/resident/invoices`
  - **Service Interface:** `com.example.apartmentbs.service.BillingService`
    - `List<InvoiceResponse> getInvoicesByApartment(Long apartmentId)`
    - `InvoiceResponse getInvoiceById(Long id)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.BillingServiceImpl`
    - `getInvoicesByApartment`: Truy vấn hóa đơn theo `apartmentId` xếp theo tháng giảm dần, ghép nối thông tin bảng kê qua `enrichInvoiceResponse`.
  - **Repository:** `com.example.apartmentbs.repository.InvoiceRepository`
    - `findByApartmentIdOrderByBillingMonthDesc(Long apartmentId)`
  - **DTOs & Models:**
    - Response: `InvoiceResponse`, `InvoiceBreakdown`, `ApiResponse<List<InvoiceResponse>>`
    - Model: `Invoice`, `Apartment`
- **Frontend:**
  - **Component:** `src/modules/resident/MyInvoices.jsx`
    - `fetchInvoices`: Gọi API lấy danh sách hóa đơn của căn hộ hiện tại.
    - `handleViewDetail`: Mở Modal hiển thị bảng kê chi tiết (điện, nước, quản lý, xe).

---

### UC-11: Quét VietQR & Báo đã chuyển khoản (Scan VietQR & Confirm Payment)

- **Tác nhân (Actor):** `RESIDENT`.
- **Mục đích nghiệp vụ:** Thực hiện cơ chế thanh toán Plan B: Hiển thị mã QR ngân hàng tạo động bằng thẻ `<img />` theo chuẩn VietQR có sẵn số tiền và nội dung là mã hóa đơn; sau khi chuyển khoản, cư dân bấm _"Tôi đã chuyển khoản"_ để chuyển trạng thái sang `PENDING`.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.BillingController`
    - `public ResponseEntity<ApiResponse<InvoiceResponse>> confirmPayment(@PathVariable Long id)`
    - Endpoint: `POST /api/v1/resident/invoices/{id}/confirm-payment`
  - **Service Interface:** `com.example.apartmentbs.service.BillingService`
    - `InvoiceResponse confirmPayment(Long invoiceId, Long residentId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.BillingServiceImpl`
    - `public InvoiceResponse confirmPayment(Long invoiceId, Long residentId)`: Xác thực quyền của cư dân với căn hộ, kiểm tra trạng thái không được là `PAID`, chuyển `invoice.setStatus(InvoiceStatus.PENDING)` và lưu lại.
  - **Repository:** `com.example.apartmentbs.repository.InvoiceRepository`
    - `findById(Long id)`, `save(Invoice invoice)`
  - **DTOs & Models:**
    - Response: `InvoiceResponse`, `ApiResponse<InvoiceResponse>`
    - Model: `Invoice`, `InvoiceStatus.PENDING`
- **Frontend:**
  - **Component:** `src/modules/resident/MyInvoices.jsx`
    - Render động mã VietQR qua URL:
      `https://img.vietqr.io/image/<BANK>-<ACC>-compact2.png?amount=${totalAmount}&addInfo=${invoiceCode}`
    - `handleConfirmPayment`: Xác nhận cư dân đã chuyển khoản thành công.

---

### UC-12: Đối soát sao kê & Gạch nợ thủ công (Manual Payment Reconciliation)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Ban quản lý đối chiếu sao kê tài khoản ngân hàng tòa nhà. Nếu đã nhận đủ tiền: bấm **Duyệt (Approve)** $\rightarrow$ chuyển hóa đơn thành `PAID`, lưu Admin duyệt và thời gian duyệt. Nếu chưa nhận được: bấm **Từ chối (Reject)** $\rightarrow$ trả về `UNPAID` (`BR-06`).
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.BillingController`
    - `searchInvoices(...)` $\rightarrow$ `GET /api/v1/admin/invoices`
    - `approveInvoice(@PathVariable Long id)` $\rightarrow$ `PUT /api/v1/admin/invoices/{id}/approve`
    - `rejectInvoice(@PathVariable Long id)` $\rightarrow$ `PUT /api/v1/admin/invoices/{id}/reject`
  - **Service Interface:** `com.example.apartmentbs.service.BillingService`
    - `InvoiceResponse approveInvoice(Long invoiceId, Long adminId)`
    - `InvoiceResponse rejectInvoice(Long invoiceId)`
    - `PageResponse<InvoiceResponse> searchInvoicesPaged(...)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.BillingServiceImpl`
    - `approveInvoice`: Đặt `status = InvoiceStatus.PAID`, gán `approvedBy = admin`, `paidAt = LocalDateTime.now()`.
    - `rejectInvoice`: Đặt `status = InvoiceStatus.UNPAID`, hủy `approvedBy = null`, `paidAt = null`.
  - **Repository:**
    - `com.example.apartmentbs.repository.InvoiceRepository`: `findById`, `save`, `findByStatus`, `findAll`
    - `com.example.apartmentbs.repository.UserRepository`: `findById(Long adminId)`
  - **DTOs & Models:**
    - Response: `InvoiceResponse`, `PageResponse<InvoiceResponse>`, `ApiResponse<...>`
    - Model: `Invoice`, `User`, `InvoiceStatus`
- **Frontend:**
  - **Component:** `src/modules/admin/InvoiceApproval.jsx`
    - `fetchInvoices`: Mặc định ưu tiên tải các hóa đơn có trạng thái `PENDING`.
    - `handleApprove`: Thực hiện duyệt gạch nợ.
    - `handleReject`: Từ chối yêu cầu gạch nợ.

---

# PHÂN HỆ 4: SỰ CỐ & CHỢ VIỆC KỸ THUẬT (HELPDESK & TASK POOL)

---

### UC-13: Tạo phiếu báo hỏng/sự cố căn hộ (Create Maintenance Ticket)

- **Tác nhân (Actor):** `RESIDENT`.
- **Mục đích nghiệp vụ:** Cư dân báo sự cố căn hộ của mình (chọn danh mục Điện/Nước/Khác, tiêu đề, nội dung mô tả, link ảnh). Hệ thống sinh mã `TCK-YYYYMM-SEQ`, gán trạng thái `OPEN` và tự động đẩy vào Chợ việc kỹ thuật chung.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.TicketController`
    - `public ResponseEntity<ApiResponse<TicketResponse>> createTicket(@Valid @RequestBody TicketCreateRequest request)`
    - Endpoint: `POST /api/v1/resident/tickets`
  - **Service Interface:** `com.example.apartmentbs.service.TicketService`
    - `TicketResponse createTicket(TicketCreateRequest request, Long residentId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.TicketServiceImpl`
    - `public TicketResponse createTicket(TicketCreateRequest request, Long residentId)`: Sinh mã `TCK-YYYYMM-XXX` theo tháng và số thứ tự, gán căn hộ và cư dân báo, đặt `status = TicketStatus.OPEN`, `assignedTo = null`.
  - **Repository:**
    - `com.example.apartmentbs.repository.TicketRepository`: `count()`, `save(Ticket ticket)`
    - `com.example.apartmentbs.repository.ApartmentRepository`: `findById`
    - `com.example.apartmentbs.repository.UserRepository`: `findById`
  - **DTOs & Models:**
    - Request: `TicketCreateRequest` (`apartmentId`, `category`, `title`, `description`, `imageUrl`)
    - Response: `TicketResponse`, `ApiResponse<TicketResponse>`
    - Model: `Ticket`, `TicketCategory`, `TicketStatus`, `Apartment`, `User`
- **Frontend:**
  - **Component:** `src/modules/resident/ReportTicket.jsx`
    - `handleCreateTicket`: Mở modal và gửi form tạo sự cố mới.

---

### UC-14: Xem danh sách sự cố chờ nhận & Cảnh báo quá 24h (View Task Pool)

- **Tác nhân (Actor):** `TECHNICIAN`.
- **Mục đích nghiệp vụ:** Kỹ thuật viên xem toàn bộ sự cố mở (`OPEN`) trong chợ việc. Hệ thống tính thời gian chờ $\Delta t = \text{hiện tại} - \text{created\_at}$. Nếu $\Delta t > 24\text{h}$, tự động gắn cờ đỏ nổi bật `[QUÁ HẠN > 24H]` (`BR-07`).
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.TicketController`
    - `getOpenTickets(...)` $\rightarrow$ `GET /api/v1/technician/tickets/pool`
    - `getOpenTicketsList()` $\rightarrow$ `GET /api/v1/technician/tickets/pool/all`
  - **Service Interface:** `com.example.apartmentbs.service.TicketService`
    - `List<TicketResponse> getOpenTickets()`
    - `PageResponse<TicketResponse> getOpenTicketsPaged(...)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.TicketServiceImpl`
    - `getOpenTickets()`, `getOpenTicketsPaged(...)`: Lọc theo `TicketStatus.OPEN`, sắp xếp các sự cố cũ nhất lên trên.
  - **Repository:** `com.example.apartmentbs.repository.TicketRepository`
    - `findByStatusOrderByCreatedAtDesc(TicketStatus.OPEN)`
    - `findByStatus(TicketStatus status, Pageable pageable)`
  - **DTOs & Models:**
    - Response: `TicketResponse` (chứa `createdAt`, `isOverdue`), `PageResponse`, `ApiResponse`
    - Model: `Ticket`, `TicketStatus`
- **Frontend:**
  - **Component:** `src/modules/technician/TaskPool.jsx`
    - `fetchOpenTickets`: Tải danh sách công việc trong chợ việc.
    - Gắn nhãn màu đỏ và viền cảnh báo cho sự cố quá hạn 24h.

---

### UC-15: Nhận việc sửa chữa từ Task Pool (Claim Ticket - Atomic Lock)

- **Tác nhân (Actor):** `TECHNICIAN`.
- **Mục đích nghiệp vụ:** Cho phép thợ chủ động nhận việc từ Chợ việc. Thực hiện **cập nhật nguyên tử (Atomic Check-and-Set) ở tầng CSDL để chống Race Condition** khi 2 thợ bấm nhận cùng một lúc (`BR-07`). Nếu ticket đã bị nhận trước, trả về lỗi `HTTP 409 Conflict`.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.TicketController`
    - `public ResponseEntity<ApiResponse<TicketResponse>> claimTicket(@PathVariable Long id)`
    - Endpoint: `POST /api/v1/technician/tickets/{id}/claim`
  - **Service Interface:** `com.example.apartmentbs.service.TicketService`
    - `TicketResponse claimTicket(Long ticketId, Long technicianId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.TicketServiceImpl`
    - `public TicketResponse claimTicket(Long ticketId, Long technicianId)`: Gọi trực tiếp hàm nguyên tử `ticketRepository.claimTicket(ticketId, technician)`. Nếu kết quả `affectedRows == 0`, throw ngay `AppException("...vừa được tiếp nhận", HttpStatus.CONFLICT)`.
  - **Repository:** `com.example.apartmentbs.repository.TicketRepository`
    - `@Modifying(clearAutomatically = true, flushAutomatically = true)`
    - `@Query("UPDATE Ticket t SET t.status = com.example.apartmentbs.model.TicketStatus.IN_PROGRESS, t.assignedTo = :technician WHERE t.id = :ticketId AND t.status = com.example.apartmentbs.model.TicketStatus.OPEN")`
    - `int claimTicket(@Param("ticketId") Long ticketId, @Param("technician") User technician)`
  - **DTOs & Models:**
    - Response: `TicketResponse`, `ApiResponse<TicketResponse>`
    - Model: `Ticket`, `User`, `TicketStatus.IN_PROGRESS`
- **Frontend:**
  - **Component:** `src/modules/technician/TaskPool.jsx`
    - `handleClaimTicket`: Gửi yêu cầu nhận việc, bắt mã lỗi 409 để hiển thị cảnh báo tranh chấp tức thì và reload lại Chợ việc.

---

### UC-16: Cập nhật tiến độ & Báo hoàn thành công việc (Resolve Ticket)

- **Tác nhân (Actor):** `TECHNICIAN`.
- **Mục đích nghiệp vụ:** Kỹ thuật viên xem danh sách các công việc đã nhận (`/technician/my-tasks`). Sau khi hoàn thành khắc phục sự cố, thợ nhập biên bản kỹ thuật (`technician_note`), chuyển trạng thái ticket sang `RESOLVED` để chờ cư dân nghiệm thu.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.TicketController`
    - `getMyTasks(...)` $\rightarrow$ `GET /api/v1/technician/tickets/my-tasks`
    - `completeTicket(@PathVariable Long id, @Valid @RequestBody TicketCompleteRequest request)` $\rightarrow$ `POST /api/v1/technician/tickets/{id}/complete`
  - **Service Interface:** `com.example.apartmentbs.service.TicketService`
    - `TicketResponse completeTicket(Long ticketId, TicketCompleteRequest request, Long technicianId)`
    - `List<TicketResponse> getAssignedTickets(Long technicianId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.TicketServiceImpl`
    - `completeTicket(...)`: Kiểm tra đúng thợ đang xử lý, kiểm tra `status == IN_PROGRESS`, lưu `technicianNote`, cập nhật `status = TicketStatus.RESOLVED`, ghi nhận `resolvedAt = LocalDateTime.now()`.
  - **Repository:** `com.example.apartmentbs.repository.TicketRepository`
    - `findByAssignedToIdOrderByCreatedAtDesc(Long technicianId)`
    - `findById(Long id)`, `save(Ticket ticket)`
  - **DTOs & Models:**
    - Request: `TicketCompleteRequest` (`technicianNote`)
    - Response: `TicketResponse`, `ApiResponse<TicketResponse>`
    - Model: `Ticket`, `TicketStatus.RESOLVED`
- **Frontend:**
  - **Component:** `src/modules/technician/MyTasks.jsx`
    - `fetchMyTasks`: Tải danh sách công việc đang xử lý của thợ.
    - `handleOpenCompleteModal`: Mở modal nhập ghi chú khắc phục.
    - `handleCompleteSubmit`: Gửi báo cáo hoàn thành.

---

### UC-17: Nghiệm thu hoàn thành & Đánh giá chất lượng 1–5 sao (Rate & Close Ticket)

- **Tác nhân (Actor):** `RESIDENT`.
- **Mục đích nghiệp vụ:** Cư dân theo dõi sự cố đã xử lý (`RESOLVED`) và đọc ghi chú của thợ. Nếu hài lòng: chấm điểm đánh giá (1–5 sao) và đóng ticket (`CLOSED`). Nếu sự cố chưa được khắc phục triệt để: bấm _"Yêu cầu làm lại"_ $\rightarrow$ ticket quay về trạng thái `IN_PROGRESS`.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.TicketController`
    - `getResidentTickets(...)` $\rightarrow$ `GET /api/v1/resident/tickets`
    - `inspectTicket(@PathVariable Long id, @RequestBody TicketRateRequest request)` $\rightarrow$ `POST /api/v1/resident/tickets/{id}/inspect`
  - **Service Interface:** `com.example.apartmentbs.service.TicketService`
    - `TicketResponse inspectTicket(Long ticketId, TicketRateRequest request, Long residentId)`
    - `List<TicketResponse> getTicketsByResident(Long residentId)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.TicketServiceImpl`
    - `inspectTicket(...)`: Kiểm tra đúng chủ hộ tạo ticket, kiểm tra `status == RESOLVED`. Nếu `request.rework == true`, trả về `IN_PROGRESS`. Nếu nghiệm thu đạt, gán `rating (1-5)` và cập nhật `status = TicketStatus.CLOSED`.
  - **Repository:** `com.example.apartmentbs.repository.TicketRepository`
    - `findByResidentIdOrderByCreatedAtDesc(Long residentId)`
    - `findById(Long id)`, `save(Ticket ticket)`
  - **DTOs & Models:**
    - Request: `TicketRateRequest` (`rating`, `rework`)
    - Response: `TicketResponse`, `ApiResponse<TicketResponse>`
    - Model: `Ticket`, `TicketStatus`
- **Frontend:**
  - **Component:** `src/modules/resident/ReportTicket.jsx`
    - `handleOpenInspectModal`: Xem chi tiết biên bản sửa chữa.
    - Sử dụng component Antd `<Rate />` để đánh giá sao.
    - `handleInspectTicket`: Gửi kết quả nghiệm thu hoặc bấm nút yêu cầu xử lý lại.

---

### UC-18: Giám sát & Điều phối cưỡng bức sự cố tồn đọng quá 24h (Force Assign)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Admin giám sát toàn bộ sự cố trong tòa nhà, lọc nhanh các sự cố mở quá 24h chưa ai nhận và cưỡng bức chỉ định một kỹ thuật viên cụ thể chịu trách nhiệm xử lý.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.TicketController` & `ApartmentController`
    - `getAllTickets(...)` $\rightarrow$ `GET /api/v1/admin/tickets`
    - `forceAssignTicket(@PathVariable Long id, @Valid @RequestBody ForceAssignRequest request)` $\rightarrow$ `PUT /api/v1/admin/tickets/{id}/force-assign`
    - `getTechnicians()` $\rightarrow$ `GET /api/v1/admin/users/technicians`
  - **Service Interface:** `com.example.apartmentbs.service.TicketService` & `ApartmentService`
    - `TicketResponse forceAssignTicket(Long ticketId, Long technicianId)`
    - `List<TicketResponse> getAllTickets()`
    - `List<UserResponse> getTechnicians()`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.TicketServiceImpl` & `ApartmentServiceImpl`
    - `forceAssignTicket(...)`: Tìm ticket, tìm kỹ thuật viên, gán `assignedTo = technician` và chuyển `status = TicketStatus.IN_PROGRESS`.
    - `getTechnicians()`: Lọc người dùng có `Role.TECHNICIAN`.
  - **Repository:**
    - `com.example.apartmentbs.repository.TicketRepository`: `findById`, `save`, `findAllByOrderByCreatedAtDesc`
    - `com.example.apartmentbs.repository.UserRepository`: `findById`, `findByRole(Role.TECHNICIAN)`
  - **DTOs & Models:**
    - Request: `ForceAssignRequest` (`technicianId`)
    - Response: `TicketResponse`, `UserResponse`, `ApiResponse<...>`
    - Model: `Ticket`, `User`, `TicketStatus.IN_PROGRESS`
- **Frontend:**
  - **Component:** `src/modules/admin/TicketManagement.jsx`
    - `fetchTickets`: Tải danh sách sự cố toàn tòa nhà.
    - Bộ lọc sự cố quá hạn 24 giờ.
    - `handleOpenAssignModal` & `handleForceAssignSubmit`: Mở modal danh sách thợ và chỉ định việc.

---

# PHÂN HỆ 5: TRUYỀN THÔNG & BẢNG TIN TÒA NHÀ (ANNOUNCEMENTS)

---

### UC-19: Đăng và Quản lý bản tin thông báo tòa nhà (Manage Announcements)

- **Tác nhân (Actor):** `ADMIN`.
- **Mục đích nghiệp vụ:** Admin đăng tải thông báo mới tới toàn thể cư dân; chỉnh sửa nội dung; gắn hoặc bỏ cờ ghim thông báo quan trọng (`is_pinned`); và xóa bỏ thông báo hết hiệu lực.
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.AnnouncementController`
    - `createAnnouncement(@Valid @RequestBody AnnouncementRequest request)` $\rightarrow$ `POST /api/v1/admin/announcements`
    - `updateAnnouncement(@PathVariable Long id, @Valid @RequestBody AnnouncementRequest request)` $\rightarrow$ `PUT /api/v1/admin/announcements/{id}`
    - `deleteAnnouncement(@PathVariable Long id)` $\rightarrow$ `DELETE /api/v1/admin/announcements/{id}`
    - `getAllAnnouncements()` $\rightarrow$ `GET /api/v1/announcements`
  - **Service Interface:** `com.example.apartmentbs.service.AnnouncementService`
    - `AnnouncementResponse createAnnouncement(AnnouncementRequest request, Long adminId)`
    - `AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request)`
    - `void deleteAnnouncement(Long id)`
    - `List<AnnouncementResponse> getAllAnnouncements()`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.AnnouncementServiceImpl`
    - `createAnnouncement`: Lưu tiêu đề, nội dung, `isPinned`, gán tài khoản Admin tạo.
    - `updateAnnouncement`: Cập nhật nội dung hoặc trạng thái ghim.
    - `deleteAnnouncement`: Xóa bản tin khỏi hệ thống.
  - **Repository:** `com.example.apartmentbs.repository.AnnouncementRepository`
    - `findById`, `save`, `delete`, `findAllByOrderByIsPinnedDescCreatedAtDesc`
    - `com.example.apartmentbs.repository.UserRepository`: `findById(Long adminId)`
  - **DTOs & Models:**
    - Request: `AnnouncementRequest` (`title`, `content`, `isPinned`)
    - Response: `AnnouncementResponse`, `ApiResponse<AnnouncementResponse>`
    - Model: `Announcement`, `User`
- **Frontend:**
  - **Component:** `src/modules/admin/Announcements.jsx`
    - `fetchAnnouncements`: Tải danh sách bản tin quản trị.
    - `handleCreateAnnouncement`: Mở modal đăng thông báo mới.
    - `handleEditAnnouncement`: Chỉnh sửa thông báo.
    - `handleDeleteAnnouncement`: Xóa thông báo.

---

### UC-20: Xem danh sách & Chi tiết thông báo tòa nhà (View Announcements)

- **Tác nhân (Actor):** `RESIDENT` (và toàn bộ người dùng trong tòa nhà).
- **Mục đích nghiệp vụ:** Cư dân theo dõi các thông báo của ban quản lý. Hệ thống luôn đảm bảo thứ tự hiển thị: **các bản tin được ghim (`is_pinned = 1`) nằm trên cùng**, sau đó sắp xếp theo thời gian mới nhất (`created_at DESC`).
- **Backend:**
  - **Controller:** `com.example.apartmentbs.controller.AnnouncementController`
    - `getAllAnnouncements()` $\rightarrow$ `GET /api/v1/announcements`
    - `getAnnouncementById(@PathVariable Long id)` $\rightarrow$ `GET /api/v1/announcements/{id}`
  - **Service Interface:** `com.example.apartmentbs.service.AnnouncementService`
    - `List<AnnouncementResponse> getAllAnnouncements()`
    - `AnnouncementResponse getAnnouncementById(Long id)`
  - **Service Implementation:** `com.example.apartmentbs.service.impl.AnnouncementServiceImpl`
    - `getAllAnnouncements`: Lấy danh sách thông báo đã được sắp xếp ưu tiên từ DB.
    - `getAnnouncementById`: Xem chi tiết từng bản tin.
  - **Repository:** `com.example.apartmentbs.repository.AnnouncementRepository`
    - `List<Announcement> findAllByOrderByIsPinnedDescCreatedAtDesc()`
    - `Optional<Announcement> findById(Long id)`
  - **DTOs & Models:**
    - Response: `AnnouncementResponse`, `ApiResponse<List<AnnouncementResponse>>`
    - Model: `Announcement`
- **Frontend:**
  - **Component:** `src/modules/resident/ResidentAnnouncements.jsx`
    - `fetchAnnouncements`: Tải danh sách thông báo.
    - Hiển thị Tag đỏ `[Quan trọng / Đã ghim]` cho các tin có `isPinned = true`.

---

# MA TRẬN TỔNG HỢP PHÂN BỔ (MASTER TRACEABILITY MATRIX)

|   Mã UC   | Tên Use Case                        | Tác nhân | Backend Controller            | Backend Service           | Spring Data Repository                        | Frontend Component                           |
| :-------: | :---------------------------------- | :------: | :---------------------------- | :------------------------ | :-------------------------------------------- | :------------------------------------------- |
| **UC-01** | Đăng nhập hệ thống                  |   All    | `AuthController`              | `AuthServiceImpl`         | `UserRepository`                              | `LoginPage.jsx`                              |
| **UC-02** | Đổi mật khẩu cá nhân                |   All    | `AuthController`              | `AuthServiceImpl`         | `UserRepository`                              | `ChangePasswordModal.jsx`                    |
| **UC-03** | Chuyển đổi căn hộ hiển thị          | Resident | `ResidentApartmentController` | `ApartmentServiceImpl`    | `ApartmentRepo`, `VehicleRepo`                | `ApartmentContext.jsx`, `ResidentLayout.jsx` |
| **UC-04** | Quản lý danh mục căn hộ (CRUD)      |  Admin   | `ApartmentController`         | `ApartmentServiceImpl`    | `ApartmentRepository`, `ApartmentSpec`        | `ApartmentManagement.jsx`                    |
| **UC-05** | Tiếp nhận cư dân mới (Move-in)      |  Admin   | `ApartmentController`         | `ApartmentServiceImpl`    | `ApartmentRepository`, `UserRepository`       | `ApartmentManagement.jsx`                    |
| **UC-06** | Bàn giao chuyển đi (Move-out)       |  Admin   | `ApartmentController`         | `ApartmentServiceImpl`    | `ApartmentRepo`, `InvoiceRepo`, `VehicleRepo` | `ApartmentManagement.jsx`                    |
| **UC-07** | Quản lý phương tiện căn hộ          |  Admin   | `ApartmentController`         | `ApartmentServiceImpl`    | `VehicleRepository`                           | `ApartmentManagement.jsx`                    |
| **UC-08** | Cấu hình biểu phí dịch vụ           |  Admin   | `BillingController`           | `BillingServiceImpl`      | `ServiceTariffRepository`                     | `MeterReading.jsx`                           |
| **UC-09** | Nhập số điện nước & Xuất HĐ         |  Admin   | `BillingController`           | `BillingServiceImpl`      | `InvoiceRepo`, `VehicleRepo`, `TariffRepo`    | `MeterReading.jsx`                           |
| **UC-10** | Xem danh sách & Chi tiết HĐ         | Resident | `BillingController`           | `BillingServiceImpl`      | `InvoiceRepository`                           | `MyInvoices.jsx`                             |
| **UC-11** | Quét VietQR & Báo chuyển tiền       | Resident | `BillingController`           | `BillingServiceImpl`      | `InvoiceRepository`                           | `MyInvoices.jsx`                             |
| **UC-12** | Đối soát sao kê & Gạch nợ           |  Admin   | `BillingController`           | `BillingServiceImpl`      | `InvoiceRepository`, `UserRepository`         | `InvoiceApproval.jsx`                        |
| **UC-13** | Tạo phiếu báo hỏng sự cố            | Resident | `TicketController`            | `TicketServiceImpl`       | `TicketRepository`, `ApartmentRepo`           | `ReportTicket.jsx`                           |
| **UC-14** | Chợ việc Task Pool & Quá 24h        |   Tech   | `TicketController`            | `TicketServiceImpl`       | `TicketRepository`                            | `TaskPool.jsx`                               |
| **UC-15** | Nhận việc sửa chữa (Atomic Claim)   |   Tech   | `TicketController`            | `TicketServiceImpl`       | `TicketRepository` (Atomic Native Query)      | `TaskPool.jsx`                               |
| **UC-16** | Báo hoàn thành công việc            |   Tech   | `TicketController`            | `TicketServiceImpl`       | `TicketRepository`                            | `MyTasks.jsx`                                |
| **UC-17** | Nghiệm thu & Chấm 1-5 sao           | Resident | `TicketController`            | `TicketServiceImpl`       | `TicketRepository`                            | `ReportTicket.jsx`                           |
| **UC-18** | Điều phối cưỡng bức sự cố quá hạn   |  Admin   | `TicketController`            | `TicketServiceImpl`       | `TicketRepository`, `UserRepository`          | `TicketManagement.jsx`                       |
| **UC-19** | Đăng & Quản lý bản tin thông báo    |  Admin   | `AnnouncementController`      | `AnnouncementServiceImpl` | `AnnouncementRepository`                      | `Announcements.jsx`                          |
| **UC-20** | Xem bảng tin tòa nhà (Ưu tiên ghim) | Resident | `AnnouncementController`      | `AnnouncementServiceImpl` | `AnnouncementRepository`                      | `ResidentAnnouncements.jsx`                  |
