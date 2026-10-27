# PROJECT GUIDELINE & FULL SRS SPECIFICATION: APARTMENT BMS

> **CHỈ THỊ HỆ THỐNG DÀNH CHO AI AGENT (SYSTEM DIRECTIVE):**
> Bạn là Senior Full-stack Developer trực tiếp xây dựng dự án **Hệ thống Quản lý Vận hành Chung cư Đơn khối (Single-Building Apartment Management System - BMS)**.
> Tài liệu này là **Nguồn Sự Thật Duy Nhất (Single Source of Truth - SRS)**. Khi sinh code (Frontend hoặc Backend), bạn **BẮT BUỘC** phải tuân thủ tuyệt đối 100% thiết kế 7 bảng CSDL, các Quy tắc Nghiệp vụ (Business Rules), Đặc tả 20 Use Cases và Cấu trúc thư mục trong file này.
> - **Nguyên tắc cốt lõi:** Tinh gọn (KISS), thực dụng cho Sprint 3 tuần với 2 Developers.
> - **Cấm tuyệt đối:** Không tự ý đẻ thêm bảng CSDL thứ 8, không tự ý dùng bảng trung gian N-N cho Căn hộ - Cư dân, không tách nhỏ thư mục con quá mức (No Over-engineering).

---

## 1. TỔNG QUAN DỰ ÁN & CÔNG NGHỆ (PROJECT OVERVIEW & TECH STACK)

### 1.1. Bối cảnh & Phạm vi
* **Tên dự án:** Single-Building Apartment Management System (BMS).
* **Mục tiêu:** Quản lý vận hành khép kín 1 tòa nhà chung cư gồm: Quản lý mặt bằng căn hộ, Cư dân (Move-in/Move-out), Phương tiện, Chốt số điện nước & Tính hóa đơn tháng, Thanh toán VietQR & Đối soát gạch nợ thủ công (Plan B), Chợ việc sửa chữa sự cố (Task Pool) và Bảng tin tòa nhà.
* **Nhân sự & Thời gian:** 2 Developers (1 Backend, 1 Frontend) — Thời gian hoàn thành: 3 tuần.

### 1.2. Tech Stack
* **Frontend:** ReactJS (khởi tạo bằng Vite), Ant Design (`antd`, `@ant-design/icons`), React-Bootstrap (`react-bootstrap`, `bootstrap`), React Router (`react-router-dom`), Axios (`axios`).
* **Backend:** RESTful API (Spring Boot / Node.js), xác thực JWT (JSON Web Token) + mã hóa mật khẩu BCrypt.
* **Database:** Microsoft SQL Server (Chuẩn hóa đúng 7 bảng).

---

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & PERMISSIONS)

Hệ thống chỉ có **3 vai trò (Roles)** cố định:

1. **`ADMIN` (Ban Quản lý tòa nhà):**
   * Quản lý danh mục căn hộ (CRUD, lọc theo tầng/trạng thái).
   * Thực hiện thủ tục Tiếp nhận cư dân vào ở (`Move-in`) và Bàn giao trả phòng (`Move-out`).
   * Quản lý danh sách phương tiện (xe máy, ô tô) gắn với từng căn hộ.
   * Cấu hình bảng giá dịch vụ duy nhất của tòa nhà.
   * Nhập chỉ số điện, nước hàng tháng và xuất hóa đơn hàng loạt cho các căn đang có người ở.
   * Đối soát sao kê ngân hàng và phê duyệt gạch nợ thủ công (`Approve` / `Reject`).
   * Giám sát sự cố toàn tòa nhà, chỉ định thợ cưỡng bức đối với các sự cố tồn đọng quá 24 giờ.
   * Đăng và ghim bản tin thông báo tòa nhà.

2. **`RESIDENT` (Cư dân / Chủ hộ đại diện):**
   * Đăng nhập, đổi mật khẩu cá nhân.
   * Chuyển đổi ngữ cảnh căn hộ đang xem qua Dropdown (`Context Switch`) nếu sở hữu từ 2 căn hộ trở lên.
   * Xem danh sách và chi tiết hóa đơn từng tháng của căn hộ đang chọn.
   * Quét mã VietQR động (tự động điền số tiền và nội dung chuyển khoản) và bấm xác nhận *"Tôi đã chuyển khoản"*.
   * Tạo phiếu báo hỏng/sự cố căn hộ, theo dõi tiến độ và nghiệm thu đánh giá (1–5 sao).
   * Xem bản tin thông báo nội bộ tòa nhà.

3. **`TECHNICIAN` (Nhân viên Kỹ thuật / Bảo trì):**
   * Đăng nhập, đổi mật khẩu cá nhân.
   * Xem danh sách các sự cố đang mở (`OPEN`) trong Chợ việc chung (`Task Pool`), nhận diện các sự cố quá hạn 24h.
   * Chủ động bấm nhận việc (`Claim Ticket`) theo cơ chế khóa nguyên tử chống tranh chấp.
   * Xem danh sách công việc của mình (`IN_PROGRESS`), cập nhật biên bản xử lý (`technician_note`) và báo hoàn thành (`RESOLVED`).

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU & SQL SCRIPT (7 BẢNG CHUẨN HÓA)

Mọi thuộc tính trong API Request/Response, Entity Backend và `mockData.js` trên Frontend phải khớp chính xác với tên cột của 7 bảng dưới đây:

```sql
-- 1. BẢNG NGƯỜI DÙNG (USERS)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'RESIDENT', 'TECHNICIAN')),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 2. BẢNG CĂN HỘ (APARTMENTS) - Quan hệ 1-N: 1 User sở hữu N Apartments
CREATE TABLE apartments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE, -- VD: 'A-101', 'B-502'
    floor INT NOT NULL CHECK (floor > 0),
    building_block NVARCHAR(50) NOT NULL,    -- VD: N'Tòa A', N'Tòa B'
    area_sqm DECIMAL(10,2) NOT NULL CHECK (area_sqm > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'VACANT' CHECK (status IN ('VACANT', 'OCCUPIED')),
    resident_id INT NULL FOREIGN KEY REFERENCES users(id),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 3. BẢNG PHƯƠNG TIỆN (VEHICLES)
CREATE TABLE vehicles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    apartment_id INT NOT NULL FOREIGN KEY REFERENCES apartments(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('MOTORBIKE', 'CAR')),
    owner_name NVARCHAR(100) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 4. BẢNG CẤU HÌNH ĐƠN GIÁ DỊCH VỤ (SERVICE_TARIFFS) - Chỉ chứa duy nhất 1 dòng (id = 1)
CREATE TABLE service_tariffs (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    management_fee_per_sqm DECIMAL(18,2) NOT NULL CHECK (management_fee_per_sqm >= 0),
    electricity_unit_price DECIMAL(18,2) NOT NULL CHECK (electricity_unit_price >= 0),
    water_unit_price DECIMAL(18,2) NOT NULL CHECK (water_unit_price >= 0),
    motorbike_fee DECIMAL(18,2) NOT NULL CHECK (motorbike_fee >= 0),
    car_fee DECIMAL(18,2) NOT NULL CHECK (car_fee >= 0),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- 5. BẢNG HÓA ĐƠN HÀNG THÁNG (INVOICES)
CREATE TABLE invoices (
    id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_code VARCHAR(50) NOT NULL UNIQUE, -- Format: INV-YYYYMM-ROOM (VD: INV-202610-A101)
    apartment_id INT NOT NULL FOREIGN KEY REFERENCES apartments(id),
    billing_month VARCHAR(7) NOT NULL,        -- Format: 'YYYY-MM' (VD: '2026-10')
    old_electric_num INT NOT NULL CHECK (old_electric_num >= 0),
    new_electric_num INT NOT NULL,
    old_water_num INT NOT NULL CHECK (old_water_num >= 0),
    new_water_num INT NOT NULL,
    total_amount DECIMAL(18,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PENDING', 'PAID')),
    due_date DATE NOT NULL,
    paid_at DATETIME2 NULL,
    approved_by INT NULL FOREIGN KEY REFERENCES users(id),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CHK_Electric_Reading CHECK (new_electric_num >= old_electric_num),
    CONSTRAINT CHK_Water_Reading CHECK (new_water_num >= old_water_num),
    CONSTRAINT UQ_Apartment_BillingMonth UNIQUE (apartment_id, billing_month)
);

-- 6. BẢNG SỰ CỐ / BÁO HỎNG (TICKETS)
CREATE TABLE tickets (
    id INT IDENTITY(1,1) PRIMARY KEY,
    ticket_code VARCHAR(50) NOT NULL UNIQUE,  -- Format: TCK-YYYYMM-SEQ
    apartment_id INT NOT NULL FOREIGN KEY REFERENCES apartments(id),
    resident_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    category VARCHAR(20) NOT NULL CHECK (category IN ('ELECTRIC', 'PLUMBING', 'OTHER')),
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    image_url VARCHAR(500) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    assigned_to INT NULL FOREIGN KEY REFERENCES users(id),
    technician_note NVARCHAR(MAX) NULL,
    rating INT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    resolved_at DATETIME2 NULL
);

-- 7. BẢNG BẢN TIN THÔNG BÁO (ANNOUNCEMENTS)
CREATE TABLE announcements (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(250) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_by INT NOT NULL FOREIGN KEY REFERENCES users(id),
    is_pinned BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
```

---

## 4. CÁC QUY TẮC NGHIỆP VỤ CỐT LÕI (CORE BUSINESS RULES)

1. **`BR-01` (Quan hệ 1-N Căn hộ & Cư dân):**
   * Một căn hộ tại một thời điểm chỉ gắn với **duy nhất 1 tài khoản đại diện** (`apartments.resident_id`). Không sử dụng bảng trung gian.
   * Một tài khoản cư dân (`user.id`) có thể đứng tên đại diện cho **nhiều căn hộ** khác nhau.
2. **`BR-02` (Chuyển đổi ngữ cảnh - Context Switch):**
   * Khi Cư dân đăng nhập, hệ thống tải danh sách các căn hộ có `resident_id = current_user.id` và `status = 'OCCUPIED'`.
   * Cư dân chọn căn hộ đang thao tác qua Dropdown trên thanh Header (`selectedApartmentId`). Toàn bộ truy vấn Hóa đơn và Sự cố phía Cư dân bắt buộc phải lọc theo `selectedApartmentId` này. Nếu chỉ có 1 căn hộ, hiển thị dạng nhãn tĩnh (Read-only).
3. **`BR-03` (Quy tắc Move-in):**
   * Chỉ thực hiện trên căn hộ có `status = 'VACANT'`.
   * Nếu SĐT cư dân chưa tồn tại trong bảng `users` $\rightarrow$ tạo tài khoản mới với `role = 'RESIDENT'`, `is_active = 1`, mật khẩu mặc định băm BCrypt.
   * Nếu SĐT đã tồn tại trong bảng `users` (cư dân mua/thuê thêm căn hộ thứ 2) $\rightarrow$ tái sử dụng `user.id` đó, kích hoạt lại `is_active = 1` (nếu trước đó bị khóa), và gán vào `apartments.resident_id`. Cập nhật căn hộ thành `OCCUPIED`.
4. **`BR-04` (Quy tắc Chặn nợ khi Move-out):**
   * Trước khi cho phép Move-out, hệ thống bắt buộc kiểm tra công nợ của căn hộ đó.
   * Nếu tồn tại bất kỳ hóa đơn nào của căn hộ đang ở trạng thái `UNPAID` hoặc `PENDING`, hệ thống **CHẶN CỨNG** thao tác Move-out và hiển thị danh sách hóa đơn nợ.
   * Khi số hóa đơn nợ $= 0$: Cập nhật căn hộ về `status = 'VACANT'`, `resident_id = NULL`; xóa toàn bộ phương tiện của căn hộ trong bảng `vehicles`. Nếu cư dân đó không còn đứng tên bất kỳ căn hộ `OCCUPIED` nào khác trong tòa nhà, cập nhật `users.is_active = 0` (Soft-disable, tuyệt đối không xóa vật lý bản ghi user hay lịch sử hóa đơn).
5. **`BR-05` (Quy tắc Chốt số & Tính tiền Hóa đơn):**
   * **Loại trừ căn trống:** Chỉ quét và lập hóa đơn cho các căn hộ có `status = 'OCCUPIED'`. Các căn `VACANT` được bỏ qua hoàn toàn.
   * **Kiểm tra chỉ số:** Bắt buộc `new_electric_num >= old_electric_num` và `new_water_num >= old_water_num`. Chỉ số cũ của kỳ này tự động lấy từ chỉ số mới của kỳ liền trước (hoặc bằng 0 nếu là kỳ đầu tiên).
   * **Công thức tính tổng tiền (`total_amount`):**
     * $\text{Tiền điện} = (\text{new\_electric\_num} - \text{old\_electric\_num}) \times \text{electricity\_unit\_price}$
     * $\text{Tiền nước} = (\text{new\_water\_num} - \text{old\_water\_num}) \times \text{water\_unit\_price}$
     * $\text{Phí quản lý} = \text{area\_sqm} \times \text{management\_fee\_per\_sqm}$
     * $\text{Phí gửi xe} = (\text{Số xe MOTORBIKE} \times \text{motorbike\_fee}) + (\text{Số xe CAR} \times \text{car\_fee})$
     * $\text{Tổng cộng (`total\_amount`)} = \text{Tiền điện} + \text{Tiền nước} + \text{Phí quản lý} + \text{Phí gửi xe}$
   * **Tách bạch công nợ:** Hóa đơn tháng nào độc lập tháng đó, không cộng dồn nợ tháng cũ vào `total_amount` của tháng mới.
6. **`BR-06` (Luồng Thanh toán VietQR & Đối soát thủ công - Plan B):**
   * Hóa đơn đi qua vòng đời 3 trạng thái: `UNPAID` (Mới tạo) $\rightarrow$ `PENDING` (Cư dân báo đã chuyển khoản) $\rightarrow$ `PAID` (Admin đối soát sao kê và duyệt).
   * Mã VietQR được render động tại Frontend bằng thẻ `<img />` qua URL chuẩn:
     `https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-compact2.png?amount=<TOTAL_AMOUNT>&addInfo=<INVOICE_CODE>`
   * Nếu Admin kiểm tra sao kê không thấy tiền hoặc chuyển sai số tiền, Admin bấm **Từ chối (Reject)** để trả hóa đơn từ `PENDING` về lại `UNPAID`.
7. **`BR-07` (Chợ việc Task Pool, Atomic Claim & Cảnh báo 24h):**
   * Khi cư dân tạo báo hỏng, ticket vào trạng thái `OPEN`, `assigned_to = NULL`.
   * **Cảnh báo quá hạn 24h:** Mọi ticket có `status = 'OPEN'` mà $(\text{Thời gian hiện tại} - \text{created\_at}) > 24\text{ giờ}$ đều bị gắn cờ đỏ `[QUÁ HẠN > 24H]`.
   * **Chống Race Condition khi Nhận việc (Claim):** Khi thợ bấm nhận việc, hệ thống chỉ cập nhật nếu `status` hiện tại vẫn đang là `'OPEN'`. Nếu thợ khác đã nhận trước một tích tắc (`status` đã thành `'IN_PROGRESS'`), hệ thống trả lỗi 409 Conflict và thông báo cho thợ.

---

## 5. ĐẶC TẢ CHI TIẾT 20 USE CASES (FULL USE CASE SPECIFICATIONS)

### PHÂN HỆ 1: XÁC THỰC & ĐIỀU HƯỚNG (AUTH & CONTEXT)

#### UC-01: Đăng nhập hệ thống (Login)
* **Tác nhân:** `ADMIN`, `RESIDENT`, `TECHNICIAN`.
* **Tiền điều kiện:** Người dùng chưa đăng nhập hoặc phiên đã hết hạn; tài khoản tồn tại trong bảng `users`.
* **Đầu vào (Input):** `username` (nhập `phone_number` hoặc `email`), `password` (mật khẩu thô).
* **Luồng xử lý chính (Main Flow):**
  1. Người dùng nhập SĐT/Email và Mật khẩu tại màn hình `/login` và bấm "Đăng nhập" (hoặc chọn nút Quick Mock Login khi test).
  2. Hệ thống tìm bản ghi trong bảng `users` khớp với `phone_number` hoặc `email`.
  3. Hệ thống kiểm tra cờ `is_active == 1` và so khớp `password` với `password_hash` bằng BCrypt.
  4. Hệ thống sinh JWT Token chứa payload `{ id, full_name, role, phone_number }`.
  5. Client lưu thông tin user & token vào `localStorage` và `AuthContext`, sau đó điều hướng theo vai trò:
     * `ADMIN` $\rightarrow$ `/admin/apartments`
     * `RESIDENT` $\rightarrow$ `/resident/invoices`
     * `TECHNICIAN` $\rightarrow$ `/technician/task-pool`
* **Luồng ngoại lệ (Exception Flow):**
  * *Sai thông tin:* Không tìm thấy user hoặc sai mật khẩu $\rightarrow$ Trả về HTTP 401, hiển thị lỗi *"Số điện thoại/Email hoặc mật khẩu không chính xác"*.
  * *Tài khoản bị khóa (`is_active == 0`):* Trả về HTTP 403, hiển thị lỗi *"Tài khoản đã bị vô hiệu hóa do cư dân đã làm thủ tục Move-out"*.
* **Đầu ra (Output):** JWT Token, thông tin User trong `AuthContext` và chuyển trang thành công.

#### UC-02: Đổi mật khẩu cá nhân (Change Password)
* **Tác nhân:** `ADMIN`, `RESIDENT`, `TECHNICIAN`.
* **Tiền điều kiện:** Người dùng đã đăng nhập thành công.
* **Đầu vào (Input):** `current_password`, `new_password` ($\ge 6$ ký tự), `confirm_password`.
* **Luồng xử lý chính (Main Flow):**
  1. Người dùng bấm vào nút "Đổi mật khẩu" trên thanh Header của Layout.
  2. Hệ thống mở Modal nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.
  3. Hệ thống kiểm tra: `current_password` khớp với mật khẩu hiện tại, `new_password.length >= 6`, và `new_password === confirm_password`.
  4. Hệ thống băm `new_password` bằng BCrypt và cập nhật cột `password_hash` trong bảng `users`.
  5. Đóng Modal và thông báo *"Đổi mật khẩu thành công"*.
* **Luồng ngoại lệ (Exception Flow):**
  * *Mật khẩu hiện tại sai:* Báo lỗi viền đỏ *"Mật khẩu hiện tại không đúng"*.
  * *Xác nhận mật khẩu lệch:* Báo lỗi *"Mật khẩu xác nhận không trùng khớp"*.
* **Đầu ra (Output):** Cột `password_hash` được cập nhật; người dùng giữ nguyên phiên đăng nhập.

#### UC-03: Chuyển đổi căn hộ hiển thị (Context Switch Apartment)
* **Tác nhân:** `RESIDENT`.
* **Tiền điều kiện:** Cư dân đã đăng nhập và đại diện cho $\ge 1$ căn hộ có `status = 'OCCUPIED'`.
* **Đầu vào (Input):** `selectedApartmentId` (ID căn hộ được chọn từ Dropdown).
* **Luồng xử lý chính (Main Flow):**
  1. Ngay sau khi đăng nhập, `ApartmentContext` lọc danh sách các căn hộ có `resident_id == user.id` và `status == 'OCCUPIED'`, tự động gán căn đầu tiên làm `selectedApartmentId`.
  2. Trên thanh Header của `ResidentLayout`, nếu cư dân có $\ge 2$ căn hộ, hệ thống hiển thị `<Select />` (Dropdown) liệt kê mã phòng và tòa nhà (VD: `A-101 (Tòa A)`, `B-502 (Tòa B)`).
  3. Cư dân chọn một căn hộ khác từ Dropdown.
  4. Hệ thống cập nhật `selectedApartmentId` vào `ApartmentContext` và `localStorage`.
  5. Màn hình hiện tại (`MyInvoices` hoặc `ReportTicket`) tự động re-render và lọc lại danh sách dữ liệu khớp với `selectedApartmentId` mới.
* **Luồng ngoại lệ (Exception Flow):**
  * *Cư dân chỉ có 1 căn hộ:* Không hiển thị mũi tên mở rộng Dropdown mà hiển thị Tag cố định tên căn hộ.
  * *Không có căn hộ nào:* Hiển thị thông báo *"Tài khoản chưa được gán căn hộ hoạt động"*.
* **Đầu ra (Output):** Toàn bộ dữ liệu hóa đơn và sự cố trên màn hình đồng bộ tức thì theo căn hộ vừa chọn.

---

### PHÂN HỆ 2: QUẢN LÝ CĂN HỘ, CƯ DÂN & PHƯƠNG TIỆN (APARTMENT & RESIDENT)

#### UC-04: Quản lý danh mục Căn hộ (CRUD Apartment)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Đăng nhập với vai trò `ADMIN`.
* **Đầu vào (Input):**
  * Khi lọc/tra cứu: Từ khóa `room_number`, bộ lọc `building_block`, bộ lọc `status` (`ALL` / `VACANT` / `OCCUPIED`).
  * Khi thêm mới/cập nhật: `room_number` (chuỗi, Unique), `floor` (số nguyên $> 0$), `building_block` (chuỗi), `area_sqm` (số thực $> 0$).
* **Luồng xử lý chính (Main Flow):**
  1. Admin mở màn hình `/admin/apartments`. Hệ thống hiển thị bảng danh sách căn hộ kèm thông tin chủ hộ hiện tại (nếu có) và số lượng xe đã đăng ký.
  2. Admin bấm nút **"Thêm căn hộ mới"**, điền thông tin: Mã phòng, Tầng, Khối nhà, Diện tích ($m^2$) và bấm Lưu.
  3. Hệ thống kiểm tra `room_number` chưa tồn tại trong bảng `apartments`.
  4. Hệ thống thêm bản ghi mới vào bảng `apartments` với `status = 'VACANT'`, `resident_id = NULL`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Trùng mã phòng:* Hệ thống chặn lưu và hiển thị lỗi *"Mã căn hộ [room_number] đã tồn tại trong tòa nhà"*.
* **Đầu ra (Output):** Bản ghi căn hộ mới được tạo và hiển thị trên bảng danh sách.

#### UC-05: Tiếp nhận cư dân mới & Tạo tài khoản (Move-in)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Căn hộ được chọn đang có `status == 'VACANT'` (`resident_id == NULL`).
* **Đầu vào (Input):** `apartment_id`, `phone_number`, `email`, `full_name`.
* **Luồng xử lý chính (Main Flow):**
  1. Trên dòng căn hộ đang có trạng thái `VACANT`, Admin bấm nút **"Move-in (Tiếp nhận)"**.
  2. Hệ thống mở Modal nhập thông tin cư dân đại diện: Họ và tên, Số điện thoại, Email (hoặc chọn nhanh từ danh sách cư dân hiện có).
  3. Admin bấm **"Xác nhận Move-in"**.
  4. Hệ thống kiểm tra `phone_number` trong bảng `users`:
     * *Trường hợp 1 (Chưa tồn tại):* Tạo mới bản ghi trong `users` với `role = 'RESIDENT'`, `is_active = 1`, mật khẩu mặc định `123456` (đã băm BCrypt). Lấy `id` vừa tạo.
     * *Trường hợp 2 (Đã tồn tại):* Lấy `id` của user đó, đảm bảo cập nhật `is_active = 1`.
  5. Hệ thống cập nhật bảng `apartments` tại `apartment_id`: gán `resident_id = user.id`, đổi `status = 'OCCUPIED'`, cập nhật `updated_at`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Căn hộ đang có người ở (`OCCUPIED`):* Không hiển thị nút Move-in hoặc chặn thao tác.
  * *Email trùng với một người dùng có SĐT khác:* Báo lỗi *"Email này đã được sử dụng bởi một tài khoản khác"*.
* **Đầu ra (Output):** Căn hộ chuyển sang trạng thái `OCCUPIED` kèm tên và SĐT cư dân đại diện.

#### UC-06: Bàn giao chuyển đi & Khóa tài khoản (Move-out)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Căn hộ đang có `status == 'OCCUPIED'`.
* **Đầu vào (Input):** `apartment_id`.
* **Luồng xử lý chính (Main Flow):**
  1. Trên dòng căn hộ `OCCUPIED`, Admin bấm nút **"Move-out (Trả phòng)"**.
  2. Hệ thống thực hiện kiểm tra công nợ bắt buộc (`BR-04`): Đếm số lượng hóa đơn của `apartment_id` có `status IN ('UNPAID', 'PENDING')`.
  3. Khi xác nhận số hóa đơn nợ $= 0$, hệ thống hiển thị hộp thoại xác nhận: *"Căn hộ [room_number] đã hoàn tất nghĩa vụ tài chính. Xác nhận làm thủ tục bàn giao trả phòng?"*.
  4. Admin bấm **"Đồng ý"**.
  5. Hệ thống thực thi chuỗi cập nhật:
     * Lưu lại `old_resident_id = apartment.resident_id`.
     * Cập nhật `apartments`: `status = 'VACANT'`, `resident_id = NULL`, `updated_at = NOW()`.
     * Xóa toàn bộ phương tiện thuộc `apartment_id` trong bảng `vehicles`.
     * Kiểm tra xem `old_resident_id` còn đứng tên căn hộ nào khác có `status = 'OCCUPIED'` không. Nếu số lượng $= 0$, cập nhật `users.is_active = 0` cho `old_resident_id`.
* **Luồng ngoại lệ (Exception Flow - Chặn nợ):**
  * *Còn hóa đơn `UNPAID` hoặc `PENDING`:* Hệ thống **chặn cứng** không cho phép Move-out, hiển thị Modal cảnh báo đỏ liệt kê rõ các mã hóa đơn và số tiền còn nợ: *"Không thể Move-out! Căn hộ còn [N] hóa đơn chưa hoàn tất thanh toán"*.
* **Đầu ra (Output):** Căn hộ trở về `VACANT`, danh sách xe của căn hộ được giải phóng, tài khoản cư dân (nếu hết phòng) chuyển sang `is_active = 0`.

#### UC-07: Quản lý phương tiện đăng ký theo căn hộ (Vehicle Management)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Căn hộ đang ở trạng thái `OCCUPIED`.
* **Đầu vào (Input):** `apartment_id`, `license_plate` (biển số), `vehicle_type` (`'MOTORBIKE'` hoặc `'CAR'`), `owner_name`.
* **Luồng xử lý chính (Main Flow):**
  1. Tại dòng căn hộ `OCCUPIED` trên màn hình Quản lý căn hộ, Admin bấm nút **"Phương tiện (Xe)"**.
  2. Hệ thống mở Modal hiển thị danh sách các xe đang đăng ký của căn hộ đó và Form thêm xe mới.
  3. Để thêm xe: Admin nhập Biển số xe, chọn Loại xe (`Xe máy` / `Ô tô`), nhập Tên chủ xe và bấm **"Thêm xe"**. Hệ thống kiểm tra trùng biển số và lưu vào bảng `vehicles`.
  4. Để xóa xe (hủy gửi xe): Admin bấm nút **"Xóa"** bên cạnh dòng xe $\rightarrow$ Xác nhận xóa bản ghi khỏi bảng `vehicles`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Trùng biển số xe (`license_plate`):* Báo lỗi *"Biển số xe này đã được đăng ký trong hệ thống"*.
* **Đầu ra (Output):** Danh sách phương tiện của căn hộ được cập nhật, làm căn cứ đếm số lượng xe khi tính hóa đơn tháng.

---

### PHÂN HỆ 3: HÓA ĐƠN, VIETQR & ĐỐI SOÁT GẠCH NỢ (BILLING & PAYMENT - PLAN B)

#### UC-08: Cấu hình bảng giá dịch vụ tòa nhà (Configure Service Tariffs)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Đăng nhập với quyền `ADMIN`.
* **Đầu vào (Input):** `management_fee_per_sqm`, `electricity_unit_price`, `water_unit_price`, `motorbike_fee`, `car_fee` (tất cả là số $\ge 0$, đơn vị VNĐ).
* **Luồng xử lý chính (Main Flow):**
  1. Tại màn hình Chốt số & Lập hóa đơn (`/admin/meter-reading`), Admin bấm nút **"Cấu hình đơn giá dịch vụ"** (hoặc xem trên thanh cấu hình phía trên bảng).
  2. Hệ thống hiển thị giá trị hiện tại từ dòng `id = 1` của bảng `service_tariffs`.
  3. Admin chỉnh sửa các đơn giá và bấm **"Lưu bảng giá"**.
  4. Hệ thống kiểm tra tất cả các số $\ge 0$ và cập nhật dòng `id = 1` trong bảng `service_tariffs`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Nhập số âm hoặc để trống:* Báo lỗi validate và không cho lưu.
* **Đầu ra (Output):** Bảng giá mới được cập nhật và áp dụng ngay cho kỳ tính hóa đơn hiện tại.

#### UC-09: Nhập chỉ số điện nước & Xuất hóa đơn tháng (Meter Reading & Batch Invoice Generation)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Bảng giá `service_tariffs` đã có dữ liệu; có ít nhất 1 căn hộ đang `OCCUPIED`.
* **Đầu vào (Input):**
  * `billing_month` (chuỗi `'YYYY-MM'`, VD: `'2026-10'`).
  * `due_date` (hạn thanh toán).
  * Danh sách chỉ số của các căn `OCCUPIED`: `apartment_id`, `old_electric_num`, `new_electric_num`, `old_water_num`, `new_water_num`.
* **Luồng xử lý chính (Main Flow):**
  1. Admin mở màn hình `/admin/meter-reading`, chọn Kỳ hóa đơn (`billing_month`).
  2. Hệ thống tự động lọc **chỉ lấy các căn hộ có `status == 'OCCUPIED'`** (bỏ qua toàn bộ căn `VACANT`).
  3. Với mỗi căn hộ, hệ thống tự động điền `old_electric_num` và `old_water_num` (lấy từ `new_electric_num` và `new_water_num` của hóa đơn kỳ trước đó; nếu chưa từng có hóa đơn thì mặc định $= 0$).
  4. Admin nhập `new_electric_num` và `new_water_num` cho từng căn hộ trên bảng.
  5. Ngay khi Admin gõ số, giao diện tự động tính nhẩm và hiển thị trực tiếp trên từng dòng:
     * Sản lượng điện tiêu thụ $= \text{new\_electric} - \text{old\_electric}$
     * Sản lượng nước tiêu thụ $= \text{new\_water} - \text{old\_water}$
     * Phí quản lý $=$ `area_sqm * management_fee_per_sqm`
     * Phí gửi xe $=$ `(số xe máy * motorbike_fee) + (số ô tô * car_fee)`
     * **Tổng tiền tạm tính (`total_amount`)** theo đúng công thức `BR-05`.
  6. Admin bấm **"Xuất hóa đơn"** (có thể xuất từng căn hoặc xuất hàng loạt cho các căn chưa tạo hóa đơn trong kỳ).
  7. Hệ thống kiểm tra toàn bộ các dòng được chọn phải thỏa mãn `new_electric_num >= old_electric_num` và `new_water_num >= old_water_num`.
  8. Hệ thống sinh mã `invoice_code` theo chuẩn `INV-{YYYYMM}-{ROOM_NUMBER}` (bỏ dấu gạch ngang ở số phòng, VD: `INV-202610-A101`) và lưu vào bảng `invoices` với `status = 'UNPAID'`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Chỉ số mới nhỏ hơn chỉ số cũ (`new < old`):* Ô nhập liệu hiện viền đỏ cảnh báo ngay lập tức kèm thông báo *"Chỉ số mới phải $\ge$ chỉ số cũ ([giá trị cũ])"*, đồng thời khóa (disable) nút Xuất hóa đơn.
  * *Căn hộ đã có hóa đơn trong kỳ `billing_month` đó:* Hiển thị nhãn `"Đã phát hành"` trên dòng căn hộ đó và không tạo trùng bản ghi mới.
* **Đầu ra (Output):** Các bản ghi hóa đơn mới được tạo trong bảng `invoices` với trạng thái `UNPAID`.

#### UC-10: Xem danh sách & Chi tiết hóa đơn căn hộ (View Resident Invoices)
* **Tác nhân:** `RESIDENT`.
* **Tiền điều kiện:** Cư dân đã đăng nhập và có `selectedApartmentId` đang được chọn.
* **Đầu vào (Input):** `selectedApartmentId` (từ `ApartmentContext`).
* **Luồng xử lý chính (Main Flow):**
  1. Cư dân truy cập màn hình `/resident/invoices`.
  2. Hệ thống lọc toàn bộ hóa đơn trong bảng `invoices` có `apartment_id == selectedApartmentId`, sắp xếp theo `billing_month` giảm dần.
  3. Hiển thị danh sách hóa đơn kèm Tag màu trạng thái rõ ràng:
     * `UNPAID`: Màu đỏ/cam (`Chưa thanh toán`)
     * `PENDING`: Màu xanh dương/vàng (`Chờ đối soát`)
     * `PAID`: Màu xanh lá (`Đã thanh toán`)
  4. Cư dân bấm vào nút **"Xem chi tiết / Thanh toán"** trên một hóa đơn.
  5. Hệ thống mở Modal hiển thị bảng kê chi tiết: Chỉ số điện cũ - mới - tiêu thụ - thành tiền; Chỉ số nước cũ - mới - tiêu thụ - thành tiền; Phí quản lý diện tích; Phí gửi xe chi tiết; Tổng cộng tiền phải thu và Hạn thanh toán.
* **Luồng ngoại lệ (Exception Flow):**
  * *Căn hộ chưa có hóa đơn nào:* Hiển thị trạng thái Empty *"Hiện chưa có hóa đơn nào cho căn hộ này"*.
* **Đầu ra (Output):** Danh sách và bảng kê chi tiết hóa đơn của căn hộ đang chọn.

#### UC-11: Quét VietQR & Báo đã chuyển khoản (Scan VietQR & Confirm Payment - Plan B)
* **Tác nhân:** `RESIDENT`.
* **Tiền điều kiện:** Hóa đơn đang mở có `status == 'UNPAID'`.
* **Đầu vào (Input):** `invoice_id`.
* **Luồng xử lý chính (Main Flow):**
  1. Trong Modal chi tiết của hóa đơn có trạng thái `UNPAID`, hệ thống tự động tạo và hiển thị ảnh mã QR chuyển khoản qua dịch vụ VietQR:
     `https://img.vietqr.io/image/MB-0901234567-compact2.png?amount=${invoice.total_amount}&addInfo=${invoice.invoice_code}`
  2. Cư dân dùng ứng dụng ngân hàng trên điện thoại quét mã QR (số tiền và nội dung chuyển khoản là mã hóa đơn đã được điền tự động) và thực hiện chuyển tiền.
  3. Sau khi chuyển tiền xong, cư dân bấm nút **"Tôi đã chuyển khoản"** ngay dưới mã QR.
  4. Hệ thống hiển thị hộp thoại xác nhận: *"Bạn xác nhận đã chuyển khoản số tiền [total_amount] VNĐ với nội dung [invoice_code]?"*.
  5. Cư dân bấm **"Xác nhận"**.
  6. Hệ thống cập nhật trạng thái hóa đơn từ `UNPAID` sang `PENDING`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Hóa đơn đang ở trạng thái `PENDING` hoặc `PAID`:* Nút *"Tôi đã chuyển khoản"* bị ẩn hoặc khóa (disabled), thay bằng thông báo trạng thái tương ứng để tránh cư dân bấm trùng lặp.
* **Đầu ra (Output):** Hóa đơn chuyển sang `status = 'PENDING'` và xuất hiện ngay trên màn hình chờ đối soát của Admin.

#### UC-12: Đối soát sao kê & Gạch nợ thủ công (Manual Payment Reconciliation - Plan B)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Có hóa đơn đang ở trạng thái `status == 'PENDING'`.
* **Đầu vào (Input):** `invoice_id`, hành động (`APPROVE` hoặc `REJECT`), `admin_id`.
* **Luồng xử lý chính (Main Flow):**
  1. Admin mở màn hình Đối soát & Duyệt hóa đơn (`/admin/invoices`), mặc định ưu tiên lọc các hóa đơn có trạng thái `PENDING` (`Chờ đối soát`).
  2. Admin kiểm tra sao kê/biến động số dư tài khoản ngân hàng thực tế của tòa nhà, đối chiếu nội dung chuyển khoản (`invoice_code`) và số tiền (`total_amount`).
  3. Nếu thấy tiền đã vào tài khoản đủ và đúng: Admin bấm nút **"Xác nhận đã nhận tiền (Duyệt)"**.
  4. Hệ thống cập nhật hóa đơn: `status = 'PAID'`, `paid_at = NOW()`, `approved_by = current_admin.id`.
* **Luồng rẽ nhánh (Alternative Flow - Từ chối gạch nợ):**
  * *3a. Không thấy tiền vào tài khoản hoặc cư dân chuyển sai/thiếu tiền:*
    1. Admin bấm nút **"Từ chối (Chưa nhận được)"**.
    2. Hệ thống xác nhận và cập nhật trạng thái hóa đơn từ `PENDING` quay trở về `UNPAID` (`paid_at = NULL`, `approved_by = NULL`) để cư dân kiểm tra và thanh toán lại.
* **Đầu ra (Output):** Hóa đơn được gạch nợ thành công (`PAID`) hoặc trả về trạng thái chưa thanh toán (`UNPAID`).

---

### PHÂN HỆ 4: SỰ CỐ & CHỢ VIỆC KỸ THUẬT (HELPDESK & SHARED TASK POOL)

#### UC-13: Tạo phiếu báo hỏng/sự cố căn hộ (Create Maintenance Ticket)
* **Tác nhân:** `RESIDENT`.
* **Tiền điều kiện:** Cư dân đã đăng nhập và có `selectedApartmentId` hợp lệ.
* **Đầu vào (Input):** `apartment_id` (lấy từ `selectedApartmentId`), `resident_id` (lấy từ `AuthContext`), `category` (`'ELECTRIC'` | `'PLUMBING'` | `'OTHER'`), `title`, `description`, `image_url` (tùy chọn).
* **Luồng xử lý chính (Main Flow):**
  1. Cư dân mở màn hình `/resident/tickets` và bấm nút **"Tạo phiếu báo hỏng"**.
  2. Cư dân chọn Phân loại sự cố (`Điện` / `Nước` / `Khác`), nhập Tiêu đề sự cố, Mô tả chi tiết tình trạng và dán Link ảnh minh họa (nếu có).
  3. Cư dân bấm **"Gửi yêu cầu"**.
  4. Hệ thống kiểm tra Tiêu đề và Mô tả không được để trống, tự sinh mã `ticket_code` (VD: `TCK-202610-005`) và lưu bản ghi vào bảng `tickets` với:
     * `status = 'OPEN'`
     * `assigned_to = NULL`
     * `created_at = NOW()`
* **Luồng ngoại lệ (Exception Flow):**
  * *Thiếu tiêu đề hoặc mô tả:* Hiển thị cảnh báo đỏ tại trường bị bỏ trống.
* **Đầu ra (Output):** Ticket mới ở trạng thái `OPEN` xuất hiện trong danh sách của căn hộ và lập tức được đẩy vào `Task Pool` chung của kỹ thuật viên.

#### UC-14: Xem danh sách sự cố chờ nhận & Cảnh báo quá 24h (View Task Pool)
* **Tác nhân:** `TECHNICIAN`.
* **Tiền điều kiện:** Đăng nhập với quyền `TECHNICIAN`.
* **Đầu vào (Input):** Bộ lọc danh mục (`ALL` / `ELECTRIC` / `PLUMBING` / `OTHER`).
* **Luồng xử lý chính (Main Flow):**
  1. Kỹ thuật viên mở màn hình Chợ việc chung (`/technician/task-pool`).
  2. Hệ thống truy vấn toàn bộ các bản ghi trong bảng `tickets` có `status == 'OPEN'`, sắp xếp ưu tiên các sự cố cũ nhất lên đầu (`created_at ASC`).
  3. Hệ thống tính toán khoảng thời gian chờ của từng ticket: $\Delta t = \text{NOW()} - \text{created\_at}$.
  4. Nếu $\Delta t > 24\text{ giờ}$, hệ thống tự động gắn huy hiệu cảnh báo màu đỏ nổi bật **`[QUÁ HẠN > 24H]`** và tô viền cảnh báo cho thẻ sự cố đó.
  5. Mỗi thẻ sự cố hiển thị rõ: Mã ticket, Số phòng, Tòa nhà, Tầng, Phân loại, Tiêu đề, Mô tả, Thời gian tạo và nút **"Nhận việc (Claim)"**.
* **Đầu ra (Output):** Danh sách trực quan các công việc đang chờ người nhận trong tòa nhà.

#### UC-15: Nhận việc sửa chữa từ Task Pool (Claim Ticket - Atomic Lock)
* **Tác nhân:** `TECHNICIAN`.
* **Tiền điều kiện:** Ticket đang hiển thị có `status == 'OPEN'` và `assigned_to == NULL`.
* **Đầu vào (Input):** `ticket_id`, `technician_id` (lấy từ `AuthContext`).
* **Luồng xử lý chính (Main Flow):**
  1. Kỹ thuật viên chọn một sự cố trong `Task Pool` và bấm nút **"Nhận việc (Claim)"**.
  2. Hệ thống thực hiện kiểm tra và cập nhật nguyên tử (Atomic Check-and-Set):
     * Kiểm tra bản ghi `ticket_id` trong kho dữ liệu hiện tại có còn đúng `status === 'OPEN'` hay không.
     * Nếu đúng là `'OPEN'`: Cập nhật `status = 'IN_PROGRESS'`, `assigned_to = technician_id`.
  3. Hệ thống thông báo *"Nhận việc thành công! Đã chuyển vào mục Việc của tôi"*. Ticket biến mất khỏi `Task Pool` và chuyển sang màn hình `MyTasks`.
* **Luồng ngoại lệ (Exception Flow - Chống Race Condition khi 2 thợ bấm cùng lúc):**
  * *Ticket vừa bị thợ khác nhận trước hoặc bị Admin gán cưỡng bức (`status !== 'OPEN'`):* Hệ thống từ chối cập nhật (HTTP 409 Conflict), hiển thị thông báo lỗi *"Rất tiếc! Sự cố này vừa được kỹ thuật viên khác tiếp nhận"*, và làm mới lại danh sách `Task Pool`.
* **Đầu ra (Output):** Ticket chuyển sang `IN_PROGRESS` và gắn đích danh `assigned_to = technician_id`.

#### UC-16: Cập nhật tiến độ & Báo hoàn thành công việc (Resolve Ticket)
* **Tác nhân:** `TECHNICIAN`.
* **Tiền điều kiện:** Ticket đang có `status == 'IN_PROGRESS'` và `assigned_to == current_technician.id`.
* **Đầu vào (Input):** `ticket_id`, `technician_note` (biên bản/ghi chú kết quả xử lý).
* **Luồng xử lý chính (Main Flow):**
  1. Kỹ thuật viên mở màn hình **"Việc của tôi"** (`/technician/my-tasks`), nơi hiển thị các ticket được giao cho chính mình.
  2. Sau khi sửa chữa xong tại căn hộ của cư dân, kỹ thuật viên bấm nút **"Báo hoàn thành"** trên ticket đó.
  3. Hệ thống mở Modal yêu cầu nhập `technician_note` (VD: *"Đã thay mới phao cơ bồn nước và kiểm tra áp lực ổn định"*).
  4. Kỹ thuật viên bấm **"Xác nhận hoàn thành"**.
  5. Hệ thống cập nhật bản ghi ticket: `status = 'RESOLVED'`, `technician_note = input_note`, `resolved_at = NOW()`.
* **Luồng ngoại lệ (Exception Flow):**
  * *Để trống ghi chú kỹ thuật (`technician_note`):* Hệ thống chặn submit và yêu cầu phải ghi rõ nội dung đã xử lý để cư dân và Admin nghiệm thu.
* **Đầu ra (Output):** Ticket chuyển sang trạng thái `RESOLVED` (`Chờ cư dân nghiệm thu`).

#### UC-17: Nghiệm thu hoàn thành & Đánh giá chất lượng 1–5 sao (Rate & Close Ticket)
* **Tác nhân:** `RESIDENT`.
* **Tiền điều kiện:** Ticket của căn hộ đang ở trạng thái `status == 'RESOLVED'`.
* **Đầu vào (Input):** `ticket_id`, quyết định nghiệm thu (`ACCEPT` hoặc `REJECT_REOPEN`), số sao đánh giá `rating` (số nguyên từ $1$ đến $5$).
* **Luồng xử lý chính (Main Flow - Nghiệm thu đạt):**
  1. Cư dân mở màn hình `/resident/tickets`, thấy sự cố của mình có trạng thái `RESOLVED` (`Thợ đã sửa xong - Chờ nghiệm thu`) kèm nội dung `technician_note`.
  2. Cư dân bấm nút **"Nghiệm thu & Đánh giá"**.
  3. Hệ thống mở Modal hiển thị biên bản của thợ và thanh chọn số sao `<Rate />` (từ 1 đến 5 sao).
  4. Cư dân chọn số sao (mặc định gợi ý 5 sao) và bấm **"Xác nhận đóng phiếu"**.
  5. Hệ thống cập nhật ticket: `status = 'CLOSED'`, `rating = selected_rating`.
* **Luồng rẽ nhánh (Alternative Flow - Chưa đạt yêu cầu, yêu cầu làm lại):**
  * *3a. Cư dân kiểm tra thấy lỗi vẫn chưa được khắc phục triệt để:*
    1. Cư dân bấm nút **"Chưa khắc phục xong (Yêu cầu xử lý lại)"**.
    2. Hệ thống đẩy trạng thái ticket từ `RESOLVED` quay ngược về `IN_PROGRESS` (`resolved_at = NULL`) để kỹ thuật viên đó tiếp tục xử lý.
* **Đầu ra (Output):** Ticket kết thúc vòng đời ở trạng thái `CLOSED` kèm điểm số đánh giá `rating` (hoặc quay lại `IN_PROGRESS` nếu chưa đạt).

#### UC-18: Giám sát & Điều phối cưỡng bức sự cố tồn đọng quá 24h (Force Assign Overdue Ticket)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Đăng nhập với quyền `ADMIN`; có ticket đang ở trạng thái `OPEN` (đặc biệt là các ticket quá 24 giờ chưa có thợ nào nhận).
* **Đầu vào (Input):** `ticket_id`, `technician_id` (ID thợ kỹ thuật được Admin chọn).
* **Luồng xử lý chính (Main Flow):**
  1. Admin mở màn hình Giám sát sự cố (`/admin/tickets`).
  2. Hệ thống hiển thị danh sách toàn bộ sự cố của tòa nhà, hỗ trợ bộ lọc nhanh **"Sự cố quá hạn > 24h"**. Các dòng ticket `OPEN` quá 24h được tô nổi bật kèm nhãn đỏ `[QUÁ HẠN > 24H]`.
  3. Tại dòng sự cố đang `OPEN`, Admin bấm nút **"Chỉ định thợ"**.
  4. Hệ thống mở Modal chứa Dropdown danh sách các nhân viên kỹ thuật đang hoạt động (`role == 'TECHNICIAN'`, `is_active == 1`).
  5. Admin chọn một kỹ thuật viên và bấm **"Giao việc ngay"**.
  6. Hệ thống cập nhật cưỡng bức bản ghi ticket: `status = 'IN_PROGRESS'`, `assigned_to = selected_technician_id`.
* **Đầu ra (Output):** Sự cố thoát khỏi trạng thái tồn đọng và được gán thẳng vào danh sách `"Việc của tôi"` của kỹ thuật viên được chỉ định.

---

### PHÂN HỆ 5: TRUYỀN THÔNG & BẢNG TIN TÒA NHÀ (ANNOUNCEMENTS)

#### UC-19: Đăng và Quản lý bản tin thông báo tòa nhà (Manage Announcements)
* **Tác nhân:** `ADMIN`.
* **Tiền điều kiện:** Đăng nhập với quyền `ADMIN`.
* **Đầu vào (Input):** `title`, `content`, `is_pinned` (Boolean: `true` / `false`).
* **Luồng xử lý chính (Main Flow):**
  1. Admin truy cập màn hình Quản lý bản tin (`/admin/announcements`).
  2. Admin bấm **"Đăng thông báo mới"**, nhập Tiêu đề, Nội dung chi tiết và tích chọn *"Ghim thông báo quan trọng lên đầu"* (`is_pinned`) nếu cần.
  3. Admin bấm **"Đăng bản tin"**.
  4. Hệ thống lưu bản ghi mới vào bảng `announcements` với `created_by = current_admin.id`, `created_at = NOW()`.
  5. Admin cũng có thể bấm bật/tắt trạng thái Ghim (`is_pinned`) hoặc Xóa các bản tin cũ trên danh sách.
* **Đầu ra (Output):** Bản tin mới được lưu và phát hành tới toàn bộ cư dân.

#### UC-20: Xem danh sách & Chi tiết thông báo tòa nhà (View Announcements)
* **Tác nhân:** `RESIDENT`.
* **Tiền điều kiện:** Đăng nhập với quyền `RESIDENT`.
* **Đầu vào (Input):** Không yêu cầu (bản tin áp dụng chung cho toàn tòa nhà).
* **Luồng xử lý chính (Main Flow):**
  1. Cư dân mở màn hình Bản tin tòa nhà (`/resident/announcements`).
  2. Hệ thống tải danh sách các bản tin từ bảng `announcements`, sắp xếp ưu tiên: **Các bản tin được ghim (`is_pinned = 1`) luôn nằm trên cùng**, sau đó sắp xếp theo thời gian đăng mới nhất (`created_at DESC`).
  3. Các bản tin có `is_pinned = 1` hiển thị kèm Tag màu đỏ `[Quan trọng / Đã ghim]`.
  4. Cư dân xem chi tiết nội dung và thời gian ban hành của từng thông báo.
* **Đầu ra (Output):** Danh sách bản tin hiển thị đúng thứ tự ưu tiên cho cư dân.

---

## 6. KIẾN TRÚC THƯ MỤC FRONTEND & QUY CHUẨN GIAO DIỆN

### 6.1. Cấu trúc thư mục chuẩn (Role-based Modular Architecture)
Không tạo thêm các thư mục con rườm rà. Giữ đúng cấu trúc tinh gọn sau:

```text
src/
├── app/
│   ├── routes.jsx                  # Cấu hình React Router & ProtectedRoute theo 3 Role
│   └── main.jsx                    # Điểm khởi chạy (Import CSS Bootstrap & render App)
├── shared/
│   ├── api/
│   │   └── axiosClient.js          # Axios instance + Interceptor tự động đính kèm Bearer Token
│   ├── constants/
│   │   └── mockData.js             # Dữ liệu khởi tạo chuẩn 7 bảng + Hàm helper đồng bộ localStorage
│   ├── components/
│   │   ├── ProtectedRoute.jsx      # Kiểm tra đăng nhập & phân quyền theo allowedRoles
│   │   └── ChangePasswordModal.jsx # Modal đổi mật khẩu dùng chung cho cả 3 Role (UC-02)
│   ├── context/
│   │   ├── AuthContext.jsx         # Quản lý user, login, mockLogin, changePassword, logout
│   │   └── ApartmentContext.jsx    # Quản lý danh sách căn hộ của Resident & selectedApartmentId (UC-03)
│   └── layouts/
│       ├── AdminLayout.jsx         # Sidebar trái (5 menu) + Header thông tin Admin + Outlet
│       ├── ResidentLayout.jsx      # Header có Dropdown đổi căn hộ (UC-03) + Navbar 3 mục + Outlet
│       └── TechLayout.jsx          # Header + Thanh điều hướng 2 tab: [Chợ việc] & [Việc của tôi]
└── modules/
    ├── auth/
    │   └── LoginPage.jsx           # UC-01: Form đăng nhập SĐT/Email + 3 nút Quick Test Role
    ├── admin/
    │   ├── ApartmentManagement.jsx # UC-04, UC-05, UC-06, UC-07: CRUD Căn hộ, Move-in, Move-out, Quản lý Xe
    │   ├── MeterReading.jsx        # UC-08, UC-09: Cấu hình đơn giá, Nhập số điện nước & Xuất hóa đơn
    │   ├── InvoiceApproval.jsx     # UC-12: Đối soát sao kê & Duyệt/Từ chối gạch nợ thủ công
    │   ├── TicketManagement.jsx    # UC-18: Giám sát sự cố toàn tòa nhà & Chỉ định thợ khi quá 24h
    │   └── Announcements.jsx       # UC-19: Đăng, ghim và xóa bản tin thông báo
    ├── resident/
    │   ├── MyInvoices.jsx          # UC-10, UC-11: Xem hóa đơn theo căn đang chọn, hiện VietQR, báo đã chuyển tiền
    │   ├── ReportTicket.jsx        # UC-13, UC-17: Tạo báo hỏng, xem tiến độ, nghiệm thu 1-5 sao hoặc yêu cầu làm lại
    │   └── ResidentAnnouncements.jsx # UC-20: Xem bảng tin tòa nhà (ưu tiên tin ghim)
    └── technician/
        ├── TaskPool.jsx            # UC-14, UC-15: Chợ việc OPEN (cảnh báo đỏ > 24h) & Nút Claim nhận việc
        └── MyTasks.jsx             # UC-16: Việc đang nhận (IN_PROGRESS) & Nhập ghi chú báo hoàn thành (RESOLVED)
```

### 6.2. Chiến lược Dữ liệu Mock đồng bộ Xuyên Vai trò (Cross-Role LocalStorage Sync)
Khi chưa kết nối Backend thật hoặc khi chạy chế độ Demo độc lập trên Frontend:
* Toàn bộ 7 bảng dữ liệu (`bms_users`, `bms_apartments`, `bms_vehicles`, `bms_tariffs`, `bms_invoices`, `bms_tickets`, `bms_announcements`) phải được khởi tạo sẵn trong `src/shared/constants/mockData.js` và lưu vào `localStorage`.
* **Dữ liệu mẫu bắt buộc phải có sẵn các kịch bản kiểm thử (Test Scenarios):**
  1. Cư dân **Hồ Anh Dũng** (`id: 3`) sở hữu **2 căn hộ** (`A-101` và `B-502`) để kiểm thử ngay tính năng Dropdown Context Switch (`UC-03`).
  2. Căn hộ `A-102` đang trống (`VACANT`) để kiểm thử ngay tính năng `Move-in` (`UC-05`).
  3. Căn hộ `A-101` đang có hóa đơn `UNPAID` để kiểm thử chặn `Move-out` (`UC-06`) và quét mã `VietQR` (`UC-11`).
  4. Có sẵn hóa đơn ở trạng thái `PENDING` để Admin kiểm thử ngay màn hình `InvoiceApproval` (`UC-12`).
  5. Có sẵn sự cố ở trạng thái `OPEN` có `created_at` cách hiện tại $> 30\text{ giờ}$ để hiển thị ngay nhãn đỏ `[QUÁ HẠN > 24H]` trên màn hình `TaskPool` (`UC-14`) và `TicketManagement` (`UC-18`).
  6. Có sẵn sự cố ở trạng thái `RESOLVED` để Cư dân kiểm thử ngay tính năng chấm sao nghiệm thu (`UC-17`).

---

## 7. QUY TẮC CODE DÀNH CHO AI AGENT (CODING STANDARDS)

1. **Chống lỗi Màn hình trắng (Zero White-Screen Policy):**
   * Luôn kiểm tra kỹ câu lệnh `import` và `export` giữa các file (`export default` vs `export const`).
   * File `src/App.jsx` bắt buộc phải gọi và trả về `<AppRoutes />` từ `./app/routes.jsx`.
   * Khi dùng Ant Design v5, sử dụng `message`, `Modal`, `Table`, `Tag`, `Card`, `Form`, `Input`, `InputNumber`, `Select`, `Rate`, `Popconfirm`, `Badge`, `Descriptions`, `Empty` đúng cú pháp chuẩn.
2. **Sử dụng Guard Clauses & Validation chặt chẽ:**
   * Viết Guard Clauses kiểm tra điều kiện hợp lệ ngay đầu mỗi hàm xử lý sự kiện (VD: kiểm tra nợ trước khi Move-out, kiểm tra `new_num < old_num` trước khi tạo hóa đơn, kiểm tra `ticket.status !== 'OPEN'` trước khi Claim).
   * Mọi thao tác thay đổi trạng thái dữ liệu đều phải có phản hồi trực quan bằng `message.success(...)` hoặc `message.error(...)`.