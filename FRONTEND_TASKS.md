# DANH SÁCH CHI TIẾT CÁC HẠNG MỤC CẦN CODE TRONG FRONTEND (REACTJS / VITE)
**Dự án:** Hệ thống Quản lý Vận hành Chung cư Đơn khối (Apartment BMS)  
**Tài liệu tham chiếu:** [ABMS_ProjectGuidelines.md](file:///e:/Springboot/SBA301_PC_ABMS/SBA301_PC_ABMS/ABMS_ProjectGuidelines.md)  
**Công nghệ:** ReactJS 19 (Vite), Ant Design (`antd`, `@ant-design/icons`), Bootstrap 5 / React-Bootstrap, React Router 7, Axios.  
**Kiến trúc:** Role-based Modular Architecture (Tinh gọn, không over-engineering).

---

## 1. TỔNG QUAN KIẾN TRÚC & QUY TẮC KỸ THUẬT FRONTEND

1. **Cấu trúc thư mục chuẩn (Role-based Modular):**
   * `src/app/`: Khởi chạy và định tuyến phân quyền (`routes.jsx`, `main.jsx`).
   * `src/shared/`: Dùng chung toàn ứng dụng gồm API client, Context, Layouts, Components và Mock Data.
   * `src/modules/`: Chia theo 4 phân hệ độc lập: `auth`, `admin`, `resident`, `technician`.
2. **Chiến lược Dữ liệu Mock đồng bộ Xuyên Vai trò (Cross-Role LocalStorage Sync):**
   * Toàn bộ 7 bảng dữ liệu (`bms_users`, `bms_apartments`, `bms_vehicles`, `bms_tariffs`, `bms_invoices`, `bms_tickets`, `bms_announcements`) được lưu trữ tại `localStorage`.
   * Mọi thao tác từ Admin (xuất hóa đơn, duyệt gạch nợ) $\leftrightarrow$ Resident (báo chuyển khoản VietQR, tạo sự cố) $\leftrightarrow$ Technician (claim ticket, báo xong) đều tác động vào kho dữ liệu chung này, đảm bảo chạy độc lập kiểm thử thông suốt 20 Use Cases trước khi đấu nối API.
3. **Quy chuẩn lập trình (Coding Standards):**
   * **Zero White-Screen Policy:** Luôn dùng Guard Clauses, kiểm tra dữ liệu null/undefined trước khi render; import/export đồng nhất.
   * **Phản hồi người dùng:** Luôn có `message.success()` hoặc `message.error()` khi người dùng thực hiện hành động.
   * **Context Switch (BR-02):** Dữ liệu của Cư dân bắt buộc lọc tự động theo `selectedApartmentId` từ `ApartmentContext`.

---

## 2. BẢNG CHECKLIST FILE CẦN CODE THEO TỪNG MODULE

### GIAI ĐOẠN 0: KHẮC PHỤC LỖI TỒN ĐỌNG & XÂY DỰNG HẠ TẦNG (FOUNDATION)

- [x] `fe/src/shared/constants/mockData.js`:
  - Khởi tạo 7 bảng dữ liệu chuẩn theo CSDL:
    - `bms_users`: Admin, Tech, Resident Hồ Anh Dũng (`id: 3`).
    - `bms_apartments`: `A-101` (OCCUPIED, resident 3), `B-502` (OCCUPIED, resident 3 - test đa căn), `A-102` (VACANT - test Move-in).
    - `bms_vehicles`: Xe ô tô `30A-999.88` và xe máy `29X1-123.45` gắn căn `A-101`.
    - `bms_tariffs`: Bảng đơn giá chuẩn duy nhất `id: 1` (phí QL, điện, nước, xe máy, ô tô).
    - `bms_invoices`: Hóa đơn mẫu `UNPAID` căn `A-101` (`INV-202610-A101`), 1 hóa đơn mẫu `PENDING` (chờ Admin đối soát).
    - `bms_tickets`: 1 ticket `OPEN` tạo cách hiện tại $> 30\text{h}$ (test nhãn đỏ quá 24h) và 1 ticket `RESOLVED` (test nghiệm thu).
    - `bms_announcements`: Bản tin ghim (`is_pinned = true`) và bản tin thường.
  - Xây dựng các hàm helper CRUD đồng bộ `localStorage` (`getUsers()`, `saveUsers()`, `getApartments()`, `saveInvoices()`...).
- [x] `fe/src/shared/context/AuthContext.jsx`:
  - Quản lý state `user` từ `localStorage`.
  - Hàm `mockLogin(role)`: Đăng nhập test nhanh 3 vai trò.
  - Hàm `login(credentials)`: Sẵn sàng đấu nối REST API `POST /api/v1/auth/login`.
  - Hàm `changePassword(oldPass, newPass)`: Cập nhật mật khẩu trong kho `bms_users`.
  - Hàm `logout()`: Xóa phiên làm việc và điều hướng về `/login`.
- [x] `fe/src/shared/context/ApartmentContext.jsx`:
  - Khắc phục file rỗng (0 bytes).
  - Lắng nghe `currentUser` từ `AuthContext`.
  - Lọc danh sách căn hộ của cư dân: `resident_id === user.id` và `status === 'OCCUPIED'`.
  - Quản lý `selectedApartmentId`, tự động gán căn đầu tiên khi đăng nhập và lưu `localStorage`.
  - Hàm `switchApartment(apartmentId)`: Cập nhật ngữ cảnh để các màn hình re-render.
- [x] `fe/src/shared/components/ProtectedRoute.jsx`:
  - Kiểm tra đăng nhập: nếu chưa có user $\rightarrow$ điều hướng về `/login`.
  - Kiểm tra phân quyền: đối chiếu `user.role` với mảng `allowedRoles`. Nếu không khớp $\rightarrow$ điều hướng về trang chủ đúng vai trò của họ.
- [x] `fe/src/shared/components/ChangePasswordModal.jsx`:
  - Modal đổi mật khẩu dùng chung cho cả 3 vai trò (UC-02).
  - Form nhập: Mật khẩu hiện tại, Mật khẩu mới ($\ge 6$ ký tự), Xác nhận mật khẩu mới.
  - Validate lỗi trực quan và gọi hàm đổi mật khẩu từ `AuthContext`.
- [x] `fe/src/shared/api/axiosClient.js`:
  - Tạo instance Axios với `baseURL: 'http://localhost:8080/api/v1'`.
  - Request Interceptor: Tự động đính kèm `Authorization: Bearer <token>` nếu có token trong `localStorage`.
  - Response Interceptor: Bắt lỗi 401 (hết hạn token) để tự động đăng xuất.
- [x] `fe/src/shared/layouts/AdminLayout.jsx`:
  - **Sửa lỗi dán nhầm code `AuthContext`**: Viết lại layout hoàn chỉnh.
  - Sidebar trái với 5 menu điều hướng:
    1. Quản lý Căn hộ & Cư dân (`/admin/apartments`)
    2. Chốt số & Hóa đơn (`/admin/meter-reading`)
    3. Đối soát gạch nợ (`/admin/invoices`)
    4. Giám sát sự cố (`/admin/tickets`)
    5. Bảng tin tòa nhà (`/admin/announcements`)
  - Header: Hiển thị tên Admin, nút "Đổi mật khẩu", nút "Đăng xuất".
  - Nội dung: `<Outlet />`.
- [x] `fe/src/shared/layouts/ResidentLayout.jsx`:
  - Khắc phục file rỗng (0 bytes).
  - Header tích hợp **Dropdown Chuyển đổi căn hộ (`UC-03`)**:
    - Nếu có $\ge 2$ căn hộ: Hiển thị `<Select />` liệt kê danh sách căn hộ kèm tòa nhà.
    - Nếu chỉ có 1 căn hộ: Hiển thị Tag cố định (Read-only).
  - Navbar 3 mục: Hóa đơn của tôi (`/resident/invoices`), Báo hỏng căn hộ (`/resident/tickets`), Bản tin tòa nhà (`/resident/announcements`).
  - Nút Đổi mật khẩu, Đăng xuất, `<Outlet />`.
- [x] `fe/src/shared/layouts/TechLayout.jsx`:
  - Khắc phục file rỗng (0 bytes).
  - Header hiển thị thông tin Kỹ thuật viên, nút Đổi mật khẩu, Đăng xuất.
  - Thanh Tabs điều hướng 2 mục: `[Chợ việc - Task Pool]` (`/technician/task-pool`) và `[Việc của tôi - My Tasks]` (`/technician/my-tasks`).
  - Nội dung: `<Outlet />`.
- [x] `fe/src/app/routes.jsx`:
  - Cập nhật toàn bộ các tuyến đường (Routes) được bảo vệ bởi `ProtectedRoute` theo đúng 3 vai trò.

---

### GIAI ĐOẠN 1: PHÂN HỆ BAN QUẢN LÝ (ADMIN MODULES)

- [ ] `fe/src/modules/admin/ApartmentManagement.jsx` (**UC-04, UC-05, UC-06, UC-07**):
  - **Danh sách căn hộ (UC-04):** Bảng hiển thị thông tin phòng, tầng, khối nhà, diện tích, trạng thái, tên chủ hộ, số xe đã đăng ký.
  - **Bộ lọc:** Lọc theo khối tòa nhà, tầng, trạng thái (`ALL`, `VACANT`, `OCCUPIED`), tìm kiếm số phòng.
  - **Thêm căn hộ mới (UC-04):** Modal thêm căn hộ, validate trùng số phòng.
  - **Move-in (Tiếp nhận cư dân - UC-05, BR-03):** 
    - Nút chỉ hiển thị trên căn `VACANT`.
    - Modal nhập SĐT, Email, Họ tên. Tự động kiểm tra SĐT nếu đã có thì tái sử dụng user, nếu chưa có thì tạo mới user `RESIDENT`.
    - Đổi trạng thái căn sang `OCCUPIED`.
  - **Move-out (Trả phòng & Chặn nợ - UC-06, BR-04):**
    - Kiểm tra công nợ: Quét các hóa đơn của căn hộ có trạng thái `UNPAID` hoặc `PENDING`.
    - **Chặn cứng** nếu còn nợ: Bật Modal cảnh báo màu đỏ liệt kê chi tiết các hóa đơn chưa hoàn thành thanh toán.
    - Nếu nợ $= 0$: Bật xác nhận $\rightarrow$ chuyển căn hộ về `VACANT`, gỡ `resident_id = null`, xóa toàn bộ xe trong bảng `vehicles`, soft-disable tài khoản cư dân nếu không còn sở hữu căn nào khác.
  - **Quản lý Phương tiện (UC-07):** Modal quản lý xe của từng căn hộ: Xem danh sách xe, Thêm xe mới (kiểm tra trùng biển số), Xóa xe.
- [ ] `fe/src/modules/admin/MeterReading.jsx` (**UC-08, UC-09, BR-05**):
  - **Cấu hình Đơn giá (UC-08):** Drawer/Modal cho phép xem và sửa 5 loại đơn giá dịch vụ (`service_tariffs`).
  - **Chọn kỳ hóa đơn (`billing_month`):** Tự động lọc **chỉ hiển thị các căn hộ `OCCUPIED`** (bỏ qua toàn bộ căn `VACANT`).
  - **Bảng nhập chỉ số:** Tự động điền số cũ từ kỳ trước (hoặc mặc định 0).
  - **Tính nhẩm trực tiếp (Realtime Calculation):** Khi gõ số mới, hệ thống tự động tính thành tiền điện, nước, phí quản lý ($m^2 \times \text{giá}$), phí gửi xe (xe máy + ô tô) và **Tổng tiền** (`BR-05`).
  - **Validation:** Bắt buộc $new \ge old$ (báo đỏ ô nhập liệu tức thì và disable nút Xuất nếu sai).
  - **Xuất hóa đơn:** Xuất từng căn hoặc xuất hàng loạt cho các căn chưa tạo trong kỳ, sinh mã `INV-YYYYMM-ROOM`, trạng thái `UNPAID`.
- [ ] `fe/src/modules/admin/InvoiceApproval.jsx` (**UC-12, BR-06 - Plan B**):
  - Màn hình đối soát sao kê, mặc định ưu tiên lọc các hóa đơn `PENDING` (Chờ đối soát).
  - Hiển thị: Mã hóa đơn, Căn hộ, Chủ hộ, Kỳ hóa đơn, Số tiền, Thời gian cư dân bấm xác nhận chuyển khoản.
  - Nút **"Duyệt (Đã nhận tiền)"**: Chuyển hóa đơn sang `PAID`, gán thời gian duyệt và tên Admin duyệt.
  - Nút **"Từ chối (Chưa nhận được)"**: Trả trạng thái hóa đơn từ `PENDING` về lại `UNPAID` để cư dân chuyển khoản lại.
- [ ] `fe/src/modules/admin/TicketManagement.jsx` (**UC-18, BR-07**):
  - Bảng giám sát toàn bộ sự cố trong tòa nhà.
  - Bộ lọc nhanh **"Sự cố quá hạn > 24h"**, tô viền đỏ nổi bật cho các ticket `OPEN` tạo cách hiện tại $> 24\text{h}$.
  - Nút **"Chỉ định thợ"**: Modal chọn kỹ thuật viên để gán cưỡng bức $\rightarrow$ chuyển ticket sang `IN_PROGRESS` và gán đích danh `assigned_to`.
- [ ] `fe/src/modules/admin/Announcements.jsx` (**UC-19**):
  - Quản lý danh sách bản tin tòa nhà.
  - Modal tạo bản tin: Tiêu đề, Nội dung chi tiết, Tùy chọn ghim bản tin lên đầu (`is_pinned`).
  - Nút Bật/Tắt ghim và nút Xóa bản tin.

---

### GIAI ĐOẠN 2: PHÂN HỆ CƯ DÂN (RESIDENT MODULES)

- [ ] `fe/src/modules/resident/MyInvoices.jsx` (**UC-10, UC-11, BR-06**):
  - Tự động lấy danh sách hóa đơn theo `selectedApartmentId` đang chọn trên Header.
  - Hiển thị danh sách hóa đơn kèm Tag trạng thái màu: `UNPAID` (Đỏ), `PENDING` (Vàng/Cam), `PAID` (Xanh lá).
  - Nút **"Xem chi tiết / Thanh toán"**: Bật Modal bảng kê chi tiết từng thành phần (điện, nước, diện tích, xe).
  - **Tích hợp VietQR động (UC-11):** Khi hóa đơn `UNPAID`, render mã QR qua URL API VietQR:  
    `https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${totalAmount}&addInfo=${invoiceCode}`
  - Nút **"Tôi đã chuyển khoản"**: Hộp thoại xác nhận $\rightarrow$ cập nhật trạng thái hóa đơn sang `PENDING`. Khóa nút nếu đã ở `PENDING` hoặc `PAID`.
- [ ] `fe/src/modules/resident/ReportTicket.jsx` (**UC-13, UC-17**):
  - Nút **"Tạo phiếu báo hỏng" (UC-13)**: Modal chọn phân loại (`Điện`, `Nước`, `Khác`), Tiêu đề, Mô tả sự cố, Link ảnh minh họa. Sinh mã `TCK-YYYYMM-SEQ`, tạo trạng thái `OPEN`.
  - Danh sách phiếu sự cố của căn hộ kèm tiến trình (Timeline/Steps).
  - **Nghiệm thu & Đánh giá (UC-17):** Khi ticket ở trạng thái `RESOLVED`:
    - Xem biên bản xử lý của thợ (`technician_note`).
    - Nút **"Nghiệm thu & Đánh giá"**: Chọn số sao (1–5 sao qua component `<Rate />`), đóng phiếu sang `CLOSED`.
    - Nút **"Chưa khắc phục xong (Yêu cầu làm lại)"**: Đẩy ticket quay về trạng thái `IN_PROGRESS` để thợ làm lại.
- [ ] `fe/src/modules/resident/ResidentAnnouncements.jsx` (**UC-20**):
  - Hiển thị bản tin thông báo tòa nhà.
  - Sắp xếp ưu tiên: **Các thông báo được ghim (`is_pinned = true`) luôn nằm trên cùng** kèm nhãn `[Quan trọng]`, sau đó đến thứ tự thời gian mới nhất.

---

### GIAI ĐOẠN 3: PHÂN HỆ KỸ THUẬT VIÊN (TECHNICIAN MODULES)

- [ ] `fe/src/modules/technician/TaskPool.jsx` (**UC-14, UC-15, BR-07**):
  - Danh sách toàn bộ các sự cố `OPEN` chưa có thợ nhận trong tòa nhà.
  - Tự động tính thời gian chờ: Nếu ticket tạo cách hiện tại $> 24\text{ giờ}$ $\rightarrow$ gắn cờ đỏ `[QUÁ HẠN > 24H]`.
  - Nút **"Nhận việc (Claim)" (UC-15 - Atomic Check)**:
    - Kiểm tra trạng thái hiện tại còn `OPEN` không.
    - Nếu còn `OPEN` $\rightarrow$ gán `assigned_to = technician.id`, đổi sang `IN_PROGRESS`, tự động chuyển sang tab "Việc của tôi".
    - Nếu đã bị nhận bởi thợ khác hoặc Admin đã chỉ định $\rightarrow$ báo lỗi xung đột (HTTP 409 Conflict) và làm mới danh sách.
- [ ] `fe/src/modules/technician/MyTasks.jsx` (**UC-16**):
  - Danh sách các ticket đang thực hiện (`IN_PROGRESS`) thuộc về chính kỹ thuật viên đang đăng nhập.
  - Nút **"Báo hoàn thành"**:
    - Bật Modal bắt buộc nhập biên bản xử lý (`technician_note`).
    - Cập nhật trạng thái ticket sang `RESOLVED` (chờ cư dân nghiệm thu), lưu `resolved_at = NOW()`.

---

### GIAI ĐOẠN 4: ĐẤU NỐI REST API BACKEND & KIỂM THỬ TÍCH HỢP (E2E)

- [ ] Đấu nối `axiosClient` thay thế mock data khi Backend sẵn sàng.
- [ ] Kiểm thử 5 kịch bản tích hợp khép kín:
  - **Kịch bản 1 (Context Switch):** Đổi giữa căn hộ `A-101` và `B-502` trên Header $\rightarrow$ Dữ liệu hóa đơn, sự cố đổi tức thì.
  - **Kịch bản 2 (Chốt số & Hóa đơn):** Nhập số điện nước $\rightarrow$ Tính nhẩm đúng $\rightarrow$ Xuất hóa đơn đúng mã `INV-YYYYMM-ROOM`.
  - **Kịch bản 3 (VietQR & Gạch nợ):** Cư dân quét VietQR $\rightarrow$ Báo đã chuyển (`PENDING`) $\rightarrow$ Admin duyệt (`PAID`).
  - **Kịch bản 4 (Chặn nợ Move-out):** Căn còn nợ $\rightarrow$ Move-out bị chặn cứng. Căn hết nợ $\rightarrow$ Move-out thành công.
  - **Kịch bản 5 (Báo hỏng $\rightarrow$ Chợ việc $\rightarrow$ Nghiệm thu):** Tạo ticket $\rightarrow$ Task Pool $\rightarrow$ Claim $\rightarrow$ Resolve $\rightarrow$ Nghiệm thu chấm 5 sao đóng phiếu.
