# BỘ KỊCH BẢN KIỂM THỬ TOÀN DIỆN CHO CÁC LUỒNG CHÍNH QUAN TRỌNG
## (Apartment Building Management System - Master Test Suite)

> Tài liệu này đặc tả chi tiết **Kịch bản kiểm thử (Test Scenarios & Test Cases)** cho **5 Luồng nghiệp vụ cốt lõi** trong hệ thống ABMS. Bao gồm các bước thực hiện chi tiết, dữ liệu kiểm thử, kết quả mong đợi trên giao diện người dùng (Frontend), phản hồi API (Backend) và trạng thái cơ sở dữ liệu (Database SQL).

---

## MỤC LỤC
1. [Bảng tổng hợp 5 luồng kiểm thử trọng điểm](#1-bảng-tổng-hợp-5-luồng-kiểm-thử-trọng-điểm)
2. [Luồng 1: Move-in & Move-out có Chặn nợ (BR-03, BR-04)](#2-luồng-1-move-in--move-out-có-chặn-nợ-br-03-br-04)
   - [TC 1.1: Tiếp nhận cư dân mới (Move-in thành công)](#tc-11-tiếp-nhận-cư-dân-mới-move-in-thành-công)
   - [TC 1.2: Chặn Move-out khi căn hộ còn nợ hóa đơn (BR-04)](#tc-12-chặn-move-out-khi-căn-hộ-còn-nợ-hóa-đơn-br-04)
   - [TC 1.3: Move-out thành công & Khóa mềm tài khoản khi hết căn](#tc-13-move-out-thành-công--khóa-mềm-tài-khoản-khi-hết-căn)
   - [TC 1.4: Move-out 1 căn của cư dân sở hữu nhiều căn (Bảo toàn đăng nhập)](#tc-14-move-out-1-căn-của-cư-dân-sở-hữu-nhiều-căn-bảo-toàn-đăng-nhập)
3. [Luồng 2: Ngữ cảnh Căn hộ - Cư dân 1-N (Context Switch - BR-01, BR-02)](#3-luồng-2-ngữ-cảnh-căn-hộ---cư-dân-1-n-context-switch---br-01-br-02)
   - [TC 2.1: Hiển thị Dropdown chuyển căn hộ khi sở hữu nhiều căn](#tc-21-hiển-thị-dropdown-chuyển-căn-hộ-khi-sở-hữu-nhiều-căn)
   - [TC 2.2: Chuyển đổi căn hộ & Tự động đồng bộ dữ liệu (Zero Reload)](#tc-22-chuyển-đổi-căn-hộ--tự-động-đồng-bộ-dữ-liệu-zero-reload)
4. [Luồng 3: Chốt số điện nước & Xuất hóa đơn tháng (BR-05)](#4-luồng-3-chốt-số-điện-nước--xuất-hóa-đơn-tháng-br-05)
   - [TC 3.1: Tự động loại trừ các căn hộ trống (VACANT)](#tc-31-tự-động-loại-trừ-các-căn-hộ-trống-vacant)
   - [TC 3.2: Kiểm tra ràng buộc Chỉ số mới >= Chỉ số cũ](#tc-32-kiểm-tra-ràng-buộc-chỉ-số-mới--chỉ-số-cũ)
   - [TC 3.3: Tự động tính nhẩm 4 khoản mục theo công thức chuẩn](#tc-33-tự-động-tính-nhẩm-4-khoản-mục-theo-công-thức-chuẩn)
   - [TC 3.4: Xuất hóa đơn hàng loạt và lưu trạng thái UNPAID](#tc-34-xuất-hóa-đơn-hàng-loạt-và-lưu-trạng-thái-unpaid)
5. [Luồng 4: Thanh toán VietQR & Đối soát gạch nợ Plan B (BR-06)](#5-luồng-4-thanh-toán-vietqr--đối-soát-gạch-nợ-plan-b-br-06)
   - [TC 4.1: Render VietQR động & Cư dân báo đã chuyển khoản](#tc-41-render-vietqr-động--cư-dân-báo-đã-chuyển-khoản)
   - [TC 4.2: Admin từ chối gạch nợ (Reject -> Trả về UNPAID)](#tc-42-admin-từ-chối-gạch-nợ-reject---trả-về-unpaid)
   - [TC 4.3: Admin phê duyệt gạch nợ (Approve -> Chuyển sang PAID)](#tc-43-admin-phê-duyệt-gạch-nợ-approve---chuyển-sang-paid)
6. [Luồng 5: Chợ việc Kỹ thuật & Khóa nguyên tử chống tranh chấp (BR-07)](#6-luồng-5-chợ-việc-kỹ-thuật--khóa-nguyên-tử-chống-tranh-chấp-br-07)
   - [TC 5.1: Cảnh báo sự cố tồn đọng quá 24 giờ](#tc-51-cảnh-báo-sự-cố-tồn-đọng-quá-24-giờ)
   - [TC 5.2: Khóa nguyên tử chống tranh chấp khi nhận việc (Atomic Lock Claim)](#tc-52-khóa-nguyên-tử-chống-tranh-chấp-khi-nhận-việc-atomic-lock-claim)
   - [TC 5.3: Cập nhật tiến độ & Báo hoàn thành công việc (Resolve)](#tc-53-cập-nhật-tiến-độ--báo-hoàn-thành-công-việc-resolve)
   - [TC 5.4: Nghiệm thu Đạt (Chấm 1-5 sao) vs Chưa đạt (Yêu cầu làm lại)](#tc-54-nghiệm-thu-đạt-chấm-1-5-sao-vs-chưa-đạt-yêu-cầu-làm-lại)
   - [TC 5.5: Admin điều phối cưỡng bức sự cố quá hạn 24h](#tc-55-admin-điều-phối-cưỡng-bức-sự-cố-quá-hạn-24h)
7. [Checklist tổng hợp đánh giá bàn giao](#7-checklist-tổng-hợp-đánh-giá-bàn-giao)

---

## 1. BẢNG TỔNG HỢP 5 LUỒNG KIỂM THỬ TRỌNG ĐIỂM

| Luồng | Mã Kịch Bản | Use Case Trọng Tâm | Quy Tắc Nghiệp Vụ (BR) | Mục Tiêu Chính |
| :---: | :---: | :--- | :--- | :--- |
| **1** | `TS-01` | **Move-in & Move-out có Chặn nợ** | `BR-03`, `BR-04` | Tiếp nhận cư dân, chặn cứng trả phòng nếu còn nợ, tự khóa tài khoản khi hết căn. |
| **2** | `TS-02` | **Ngữ cảnh Căn hộ (Context Switch)** | `BR-01`, `BR-02` | Hỗ trợ 1 cư dân sở hữu N căn, chuyển căn hộ trên Header không reload trang. |
| **3** | `TS-03` | **Chốt số & Tính hóa đơn tháng** | `BR-05` | Bỏ qua căn trống, nhập số mới $\ge$ số cũ, tính nhẩm 4 loại phí, sinh mã `INV`. |
| **4** | `TS-04` | **VietQR & Gạch nợ thủ công (Plan B)** | `BR-06` | Render QR động, cư dân báo chuyển tiền (`PENDING`), Admin duyệt (`PAID`) hoặc từ chối (`UNPAID`). |
| **5** | `TS-05` | **Chợ việc, Atomic Claim & Vòng đời Ticket**| `BR-07` | Cảnh báo > 24h, cập nhật nguyên tử chống tranh chấp 409 Conflict, nghiệm thu 1-5 sao/rework. |

---

## 2. LUỒNG 1: MOVE-IN & MOVE-OUT CÓ CHẶN NỢ (`BR-03`, `BR-04`)

### TC 1.1: Tiếp nhận cư dân mới (Move-in thành công)
* **Mã Test Case:** `TC_MOVEIN_01`
* **Mục tiêu:** Căn hộ trống (`VACANT`) tiếp nhận cư dân mới, tự động tạo tài khoản cư dân và chuyển trạng thái căn hộ sang `OCCUPIED`.
* **Tiền điều kiện:** Căn hộ `A-102` đang có trạng thái `VACANT`.
* **Dữ liệu kiểm thử:**
  * Căn hộ ID: `A-102`
  * Họ và tên: `Lê Thị Mai`
  * Số điện thoại: `0908888777`
  * Email: `mai.le@building.vn`
* **Các bước thực hiện:**
  1. Đăng nhập hệ thống với tài khoản `ADMIN` (`0901000001` / `123456`).
  2. Truy cập menu **Quản lý căn hộ** (`/admin/apartments`).
  3. Tại dòng căn hộ `A-102` (Tag xám `VACANT`), bấm nút **"Move-in (Tiếp nhận)"**.
  4. Nhập đầy đủ thông tin: Họ tên, Số điện thoại, Email.
  5. Bấm nút **"Xác nhận Move-in"**.
* **Kết quả mong đợi:**
  * **Frontend:** Căn hộ `A-102` chuyển sang Tag xanh lá **`OCCUPIED`**, cột Chủ hộ hiển thị `Lê Thị Mai (0908888777)`.
  * **Backend API:** Trả về HTTP `200 OK`, `ApiResponse.data.status = 'OCCUPIED'`.
  * **Database (SQL Server):**
    * Bảng `users`: Sinh bản ghi mới với `phone_number = '0908888777'`, `role = 'RESIDENT'`, `is_active = 1`, `password_hash` được băm BCrypt mật khẩu mặc định `123456`.
    * Bảng `apartments`: Bản ghi `A-102` được cập nhật `resident_id = <new_user_id>`, `status = 'OCCUPIED'`.

---

### TC 1.2: Chặn Move-out khi căn hộ còn nợ hóa đơn (BR-04)
* **Mã Test Case:** `TC_MOVEOUT_BLOCK_DEBT`
* **Mục tiêu:** Kiểm tra quy tắc nghiệp vụ `BR-04`: Chặn cứng không cho phép trả phòng nếu căn hộ còn bất kỳ hóa đơn nào ở trạng thái `UNPAID` hoặc `PENDING`.
* **Tiền điều kiện:** Căn hộ `A-101` (`OCCUPIED`) đang có 1 hóa đơn kỳ `2026-10` ở trạng thái `UNPAID` (hoặc `PENDING`) với số tiền `2.395.000` VNĐ.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản `ADMIN`.
  2. Vào trang **Quản lý căn hộ** (`/admin/apartments`).
  3. Tại dòng căn hộ `A-101`, bấm nút màu đỏ **"Move-out (Trả phòng)"**.
* **Kết quả mong đợi:**
  * **Frontend:**
    * Modal mở ra hiển thị **Alert cảnh báo màu đỏ**: `"CHẶN MOVE-OUT: CĂN HỘ CÒN CÔNG NỢ CHƯA THANH TOÁN (BR-04)"`.
    * Danh sách liệt kê chi tiết: Mã hóa đơn `INV-202610-A101`, kỳ `2026-10`, số tiền `2.395.000 đ`, trạng thái `UNPAID`.
    * Nút "Xác nhận Bàn giao & Move-out" bị **khóa xám (Disabled)**, không cho phép bấm.
  * **Backend API (nếu gửi request trực tiếp bằng Postman/cURL):**
    * Trả về HTTP Status Code: `409 Conflict`.
    * Body message: `"KHÔNG THỂ THỰC HIỆN DỌN ĐI (Move-out): Căn hộ A-101 hiện còn 1 hóa đơn chưa thanh toán hoặc đang chờ duyệt (BR-04)..."`.
  * **Database:** Căn hộ `A-101` giữ nguyên trạng thái `OCCUPIED`, các bản ghi xe và chủ hộ không bị thay đổi.

---

### TC 1.3: Move-out thành công & Khóa mềm tài khoản khi hết căn
* **Mã Test Case:** `TC_MOVEOUT_SUCCESS_DEACTIVATE`
* **Mục tiêu:** Khi căn hộ đã sạch nợ (`unpaidCount == 0`), tiến hành Move-out: giải phóng xe, đưa căn hộ về `VACANT`, và tự động khóa tài khoản cư dân nếu họ không còn căn nào khác trong tòa nhà.
* **Tiền điều kiện:** 
  * Căn hộ cần Move-out đã hoàn tất thanh toán toàn bộ hóa đơn (`0 hóa đơn nợ`).
  * Cư dân này chỉ sở hữu duy nhất căn hộ này.
* **Các bước thực hiện:**
  1. Admin bấm nút **"Move-out"** trên dòng căn hộ.
  2. Hệ thống kiểm tra hợp lệ và hiển thị thông báo xanh: `"ĐỦ ĐIỀU KIỆN TRẢ PHÒNG (0 HÓA ĐƠN NỢ)"`.
  3. Admin bấm nút **"Xác nhận Bàn giao & Move-out"**.
* **Kết quả mong đợi:**
  * **Frontend:** Thông báo thành công, căn hộ đổi sang Tag xám **`VACANT`**, Chủ hộ hiển thị dấu `-`, số lượng xe về `0`.
  * **Backend:** Trả về HTTP `200 OK`.
  * **Database:**
    * Bảng `vehicles`: Toàn bộ các bản ghi phương tiện gắn với căn hộ này bị xóa bỏ (`DELETE FROM vehicles WHERE apartment_id = ?`).
    * Bảng `apartments`: Căn hộ được cập nhật `resident_id = NULL`, `status = 'VACANT'`.
    * Bảng `users`: Cột `is_active` của cư dân cũ được chuyển thành `0` (`false`) (khóa mềm tài khoản).
  * **Kiểm tra đăng nhập lại:** Cư dân cũ dùng SĐT đăng nhập lại $\rightarrow$ Bị chặn ngay từ tầng Service với mã `403 Forbidden` (`"Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Ban Quản Lý"`).

---

### TC 1.4: Move-out 1 căn của cư dân sở hữu nhiều căn (Bảo toàn đăng nhập)
* **Mã Test Case:** `TC_MOVEOUT_MULTI_APT_KEEP_ACTIVE`
* **Mục tiêu:** Đảm bảo cư dân sở hữu từ 2 căn hộ trở lên khi trả bớt 1 căn thì tài khoản vẫn hoạt động bình thường trên các căn còn lại.
* **Tiền điều kiện:** Cư dân **Hồ Anh Dũng** (`id = 3`) sở hữu 2 căn hộ: `A-101` và `B-502` đều đang `OCCUPIED`. Căn `A-101` không còn nợ.
* **Các bước thực hiện:**
  1. Admin thực hiện thủ tục Move-out cho căn `A-101`.
* **Kết quả mong đợi:**
  * Căn `A-101` chuyển về trạng thái `VACANT`.
  * Hệ thống kiểm tra: Cư dân Hồ Anh Dũng vẫn còn căn `B-502` có `status = 'OCCUPIED'` (`remainingCount == 1`).
  * Trong bảng `users`: Cột `is_active` của Hồ Anh Dũng **giữ nguyên là 1 (`true`)**, hoàn toàn không bị khóa.
  * **Kiểm tra đăng nhập:** Ông Dũng đăng nhập lại thành công 100%, Dropdown căn hộ trên Header giờ chỉ còn lại căn `B-502`.

---

## 3. LUỒNG 2: NGỮ CẢNH CĂN HỘ - CƯ DÂN 1-N (CONTEXT SWITCH - `BR-01`, `BR-02`)

### TC 2.1: Hiển thị Dropdown chuyển căn hộ khi sở hữu nhiều căn
* **Mã Test Case:** `TC_CONTEXT_SWITCH_DROPDOWN_DISPLAY`
* **Mục tiêu:** Kiểm tra việc tự động phát hiện số lượng căn hộ sở hữu và hiển thị thành phần giao diện tương ứng trên Header.
* **Tiền điều kiện:** Tài khoản cư dân Hồ Anh Dũng (`0903000001` / `123456`) đang sở hữu 2 căn: `A-101 (Tòa A)` và `B-502 (Tòa B)`.
* **Các bước thực hiện:**
  1. Đăng nhập bằng tài khoản của cư dân Hồ Anh Dũng.
  2. Quan sát phần hiển thị căn hộ trên Header của `ResidentLayout`.
* **Kết quả mong đợi:**
  * Header xuất hiện Dropdown `<Select />` cho phép lựa chọn.
  * Mặc định chọn căn đầu tiên: `A-101 (Tòa A)`.
  * Khi click mở rộng Dropdown: Hiển thị đầy đủ danh sách 2 căn: `A-101 (Tòa A)` và `B-502 (Tòa B)`.
  *(Nếu test với cư dân chỉ có 1 căn: Dropdown không có mũi tên mở rộng mà hiển thị dạng Tag nhãn tĩnh).*

---

### TC 2.2: Chuyển đổi căn hộ & Tự động đồng bộ dữ liệu (Zero Reload)
* **Mã Test Case:** `TC_CONTEXT_SWITCH_REALTIME_SYNC`
* **Mục tiêu:** Khi cư dân chọn căn hộ khác, toàn bộ dữ liệu Hóa đơn và Báo hỏng sự cố tự động đổi theo căn hộ mới mà không cần F5/reload lại trang web.
* **Các bước thực hiện:**
  1. Đang ở màn hình **Hóa đơn của tôi** (`/resident/invoices`), đang xem các hóa đơn của căn `A-101`.
  2. Tại Dropdown trên Header, click chọn sang căn **`B-502 (Tòa B)`**.
  3. Chuyển tiếp sang menu **Báo hỏng sự cố** (`/resident/tickets`).
* **Kết quả mong đợi:**
  * Trình duyệt **không bị reload lại trang** (Single Page Application behavior).
  * State `selectedApartmentId` trong `ApartmentContext` và `localStorage` lập tức cập nhật ID của căn `B-502`.
  * Bảng danh sách hóa đơn tự động re-render và chỉ hiển thị các hóa đơn thuộc căn `B-502`.
  * Trang Báo hỏng sự cố cũng tự động lọc danh sách phiếu sự cố gắn với căn `B-502`.

---

## 4. LUỒNG 3: CHỐT SỐ ĐIỆN NƯỚC & XUẤT HÓA ĐƠN THÁNG (`BR-05`)

### TC 3.1: Tự động loại trừ các căn hộ trống (VACANT)
* **Mã Test Case:** `TC_BILLING_EXCLUDE_VACANT`
* **Mục tiêu:** Hệ thống bắt buộc chỉ lập hóa đơn cho các căn đang có người ở (`OCCUPIED`), loại bỏ hoàn toàn các căn hộ trống (`VACANT`).
* **Tiền điều kiện:** Trong tòa nhà có căn `A-101` (`OCCUPIED`) và căn `A-102` (`VACANT`).
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản `ADMIN`.
  2. Truy cập màn hình **Chốt số & Lập hóa đơn** (`/admin/meter-reading`).
  3. Chọn kỳ hóa đơn cần tính (ví dụ: `2026-11`).
* **Kết quả mong đợi:**
  * Bảng nhập chỉ số **chỉ hiển thị các căn `OCCUPIED`** (như `A-101`, `B-502`).
  * Tuyệt đối **không xuất hiện** căn trống `A-102`.

---

### TC 3.2: Kiểm tra ràng buộc Chỉ số mới >= Chỉ số cũ
* **Mã Test Case:** `TC_BILLING_VALIDATE_READING`
* **Mục tiêu:** Chặn lỗi người dùng nhập số điện/nước mới nhỏ hơn số kỳ trước.
* **Các bước thực hiện:**
  1. Tại dòng căn hộ `A-101` (số điện kỳ trước tự động nạp là `180`):
  2. Admin nhập vào ô Số điện mới giá trị: `160` (nhỏ hơn `180`).
* **Kết quả mong đợi:**
  * Ô nhập liệu đổi viền đỏ cảnh báo ngay tức khắc.
  * Hiển thị thông báo lỗi tại chỗ: `"Chỉ số mới phải >= chỉ số cũ (180)"`.
  * Nút "Xuất hóa đơn" bị **khóa (Disabled)**, ngăn chặn thao tác submit lỗi.

---

### TC 3.3: Tự động tính nhẩm 4 khoản mục theo công thức chuẩn
* **Mã Test Case:** `TC_BILLING_FORMULA_CALCULATION`
* **Mục tiêu:** Xác minh tính chính xác của công thức tính tiền tổng hợp theo `BR-05`.
* **Dữ liệu kiểm thử:**
  * Căn `A-101`: Diện tích $75.5\text{ m}^2$, đang đăng ký 1 xe máy và 1 ô tô.
  * Bảng đơn giá `service_tariffs`: Điện $3.500$ đ/kWh, Nước $15.000$ đ/$m^3$, Phí QL $10.000$ đ/$m^2$, Xe máy $100.000$ đ/tháng, Ô tô $1.200.000$ đ/tháng.
  * Chỉ số cũ: Điện `180`, Nước `28`.
  * Nhập chỉ số mới: Điện `280` (tiêu thụ $100$ kWh), Nước `38` (tiêu thụ $10\text{ m}^3$).
* **Kết quả mong đợi:**
  * Cột "Tổng tiền tạm tính" tự động cập nhật ngay khi gõ số:
    * $\text{Tiền điện} = 100 \times 3.500 = 350.000\text{ đ}$
    * $\text{Tiền nước} = 10 \times 15.000 = 150.000\text{ đ}$
    * $\text{Phí quản lý} = 75.5 \times 10.000 = 755.000\text{ đ}$
    * $\text{Phí gửi xe} = (1 \times 100.000) + (1 \times 1.200.000) = 1.300.000\text{ đ}$
    * **Tổng cộng: $2.555.000\text{ đ}$** (khớp 100% từng đồng).

---

### TC 3.4: Xuất hóa đơn hàng loạt và lưu trạng thái UNPAID
* **Mã Test Case:** `TC_BILLING_BATCH_GENERATE`
* **Các bước thực hiện:**
  1. Sau khi nhập hợp lệ toàn bộ chỉ số các căn hộ, Admin bấm **"Xuất hóa đơn hàng loạt"**.
* **Kết quả mong đợi:**
  * **Frontend:** Thông báo xanh `"Chốt số và tạo hóa đơn thành công"`. Các dòng căn hộ chuyển sang nhãn `"Đã phát hành"`.
  * **Backend & Database:**
    * Tạo các bản ghi mới trong bảng `invoices`.
    * Mã hóa đơn chuẩn format: `INV-202611-A101`.
    * Cột `total_amount = 2555000.00`, cột `status = 'UNPAID'`, cột `paid_at = NULL`.

---

## 5. LUỒNG 4: THANH TOÁN VIETQR & ĐỐI SOÁT GẠCH NỢ PLAN B (`BR-06`)

### TC 4.1: Render VietQR động & Cư dân báo đã chuyển khoản
* **Mã Test Case:** `TC_PAYMENT_VIETQR_CONFIRM`
* **Tiền điều kiện:** Căn hộ có hóa đơn `INV-202611-A101` ở trạng thái `UNPAID` (Số tiền: `2.555.000` đ).
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản cư dân của căn `A-101`.
  2. Vào **Hóa đơn của tôi** (`/resident/invoices`), thấy hóa đơn có Tag màu đỏ **`Chưa thanh toán`**.
  3. Bấm nút **"Thanh toán / VietQR"**.
  4. Quan sát mã QR được tạo ra trong Modal.
  5. Cư dân thực hiện quét app ngân hàng, sau đó bấm nút xanh **"Tôi đã chuyển khoản"** $\rightarrow$ Xác nhận.
* **Kết quả mong đợi:**
  * Ảnh VietQR được render chính xác URL có chứa số tiền và nội dung chuyển khoản:
    `https://img.vietqr.io/image/<BANK>-<ACC>-compact2.png?amount=2555000&addInfo=INV-202611-A101`
  * Hóa đơn lập tức đổi màu Tag sang màu vàng/xanh **`Chờ đối soát` (`PENDING`)**.
  * Nút "Tôi đã chuyển khoản" bị ẩn/khóa để tránh bấm trùng lặp.
  * Trong Database: Cột `invoices.status` chuyển thành `'PENDING'`.

---

### TC 4.2: Admin từ chối gạch nợ (Reject -> Trả về UNPAID)
* **Mã Test Case:** `TC_PAYMENT_RECONCILE_REJECT`
* **Mục tiêu:** Kiểm tra tình huống cư dân báo đã chuyển tiền nhưng Admin kiểm tra sao kê ngân hàng thấy chưa nhận được tiền hoặc chuyển sai số tiền.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản `ADMIN`, vào menu **Duyệt hóa đơn & Gạch nợ** (`/admin/invoices`).
  2. Lọc danh sách hóa đơn đang ở trạng thái `Chờ đối soát (PENDING)`.
  3. Tại dòng hóa đơn `INV-202611-A101`, Admin bấm nút **"Từ chối (Chưa nhận được)"**.
* **Kết quả mong đợi:**
  * **Frontend:** Thông báo `"Đã từ chối xác nhận thanh toán"`.
  * **Database:** Cột `invoices.status` bị đẩy quay ngược trở về **`UNPAID`**, `paid_at = NULL`, `approved_by = NULL`.
  * Cư dân mở lại màn hình sẽ thấy hóa đơn chuyển lại về màu đỏ để tiến hành thanh toán lại.

---

### TC 4.3: Admin phê duyệt gạch nợ (Approve -> Chuyển sang PAID)
* **Mã Test Case:** `TC_PAYMENT_RECONCILE_APPROVE`
* **Tiền điều kiện:** Hóa đơn đang ở trạng thái `PENDING`, tiền đã vào tài khoản thực tế của tòa nhà.
* **Các bước thực hiện:**
  1. Admin mở màn hình Duyệt hóa đơn, đối chiếu sao kê ngân hàng thấy tiền đã vào đủ `2.555.000 đ`.
  2. Admin bấm nút **"Xác nhận đã nhận tiền (Duyệt)"**.
* **Kết quả mong đợi:**
  * **Frontend:** Hóa đơn chuyển trạng thái sang Tag màu xanh lá **`Đã thanh toán` (`PAID`)**.
  * **Database:** Bảng `invoices`:
    * Cột `status = 'PAID'`
    * Cột `paid_at = <thời_điểm_duyệt_hiện_tại>`
    * Cột `approved_by = <id_của_admin_vừa_duyệt>`.

---

## 6. LUỒNG 5: CHỢ VIỆC KỸ THUẬT & KHÓA NGUYÊN TỬ CHỐNG TRANH CHẤP (`BR-07`)

### TC 5.1: Cảnh báo sự cố tồn đọng quá 24 giờ
* **Mã Test Case:** `TC_TASKPOOL_OVERDUE_24H_ALERT`
* **Tiền điều kiện:** Trong Database có ticket sự cố `status = 'OPEN'` có thời gian `created_at` cách thời điểm hiện tại $> 24\text{ giờ}$ (ví dụ tạo từ 30 giờ trước).
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản `TECHNICIAN` (`0902000001` / `123456`).
  2. Mở màn hình **Chợ việc (Task Pool)** (`/technician/task-pool`).
* **Kết quả mong đợi:**
  * Thẻ sự cố đó tự động được sắp xếp ưu tiên hiển thị lên trên đầu.
  * Thẻ sự cố được gắn huy hiệu cảnh báo đỏ nổi bật: **`[QUÁ HẠN > 24H]`**.
  * Toàn bộ viền của thẻ được tô đỏ cảnh báo ưu tiên xử lý gấp.

---

### TC 5.2: Khóa nguyên tử chống tranh chấp khi nhận việc (Atomic Lock Claim)
* **Mã Test Case:** `TC_TASKPOOL_ATOMIC_CLAIM_RACE_CONDITION`
* **Mục tiêu:** Kiểm tra xử lý đồng thời (Concurrency): Khi 2 thợ kỹ thuật cùng bấm nhận 1 sự cố tại cùng một thời điểm, chỉ 1 người được nhận, người kia bị từ chối với lỗi `409 Conflict`.
* **Các bước thực hiện:**
  1. Mở 2 trình duyệt độc lập (hoặc 1 tab thường, 1 tab ẩn danh):
     * Tab A: Đăng nhập Thợ 1 (`0902000001`).
     * Tab B: Đăng nhập Thợ 2 (`0902000002`).
  2. Cả 2 thợ cùng truy cập Chợ việc và nhìn thấy sự cố `TCK-202610-001` đang `OPEN`.
  3. Thợ 1 bấm nút **"Nhận việc (Claim)"**.
  4. Thợ 2 bấm nút **"Nhận việc (Claim)"** ngay sau đó một tích tắc.
* **Kết quả mong đợi:**
  * **Thợ 1:** Nhận việc thành công, thông báo xanh `"Nhận việc thành công! Đã chuyển vào Việc của tôi"`. Ticket chuyển sang trạng thái `IN_PROGRESS` và thuộc về Thợ 1.
  * **Thợ 2:** Câu lệnh SQL nguyên tử `claimTicket` tại backend trả về `0 affected rows`. Backend ném mã lỗi `409 Conflict`.
  * Màn hình của Thợ 2 báo lỗi màu đỏ: 
    `"Rất tiếc! Sự cố này vừa được kỹ thuật viên khác tiếp nhận hoặc không còn ở trạng thái Chờ xử lý!"`.
  * Ticket tự động biến mất khỏi Chợ việc của Thợ 2 khi làm mới lại.

---

### TC 5.3: Cập nhật tiến độ & Báo hoàn thành công việc (Resolve)
* **Mã Test Case:** `TC_TASKPOOL_RESOLVE_TICKET`
* **Các bước thực hiện:**
  1. Thợ 1 truy cập màn hình **Việc của tôi** (`/technician/my-tasks`).
  2. Tại sự cố đang xử lý (`IN_PROGRESS`), sau khi khắc phục xong, bấm nút **"Báo hoàn thành"**.
  3. Nhập biên bản xử lý kỹ thuật: `"Đã thay gioăng cao su bồn rửa và siết lại van cấp, kiểm tra không còn rỉ nước"`.
  4. Bấm **"Xác nhận hoàn thành"**.
* **Kết quả mong đợi:**
  * **Frontend:** Ticket chuyển sang trạng thái **`RESOLVED` (Chờ nghiệm thu)**.
  * **Database:** Bảng `tickets`:
    * Cột `status = 'RESOLVED'`
    * Cột `technician_note = "Đã thay gioăng..."`
    * Cột `resolved_at = <thời_gian_hiện_tại>`.

---

### TC 5.4: Nghiệm thu Đạt (Chấm 1-5 sao) vs Chưa đạt (Yêu cầu làm lại)
* **Mã Test Case:** `TC_TICKET_INSPECT_CLOSE_AND_REWORK`
* **Tiền điều kiện:** Ticket sự cố đang ở trạng thái `RESOLVED`.
* **Kịch bản A: Nghiệm thu đạt (Close Ticket):**
  1. Cư dân vào **Báo hỏng sự cố** $\rightarrow$ Thấy ticket có trạng thái `RESOLVED`.
  2. Bấm nút **"Nghiệm thu & Đánh giá"** $\rightarrow$ Modal hiển thị biên bản của thợ.
  3. Chọn chấm 5 sao $\rightarrow$ Bấm **"Xác nhận đóng phiếu"**.
  * **Kết quả:** Ticket chuyển sang **`CLOSED`**, cột `rating = 5`. Vòng đời của ticket kết thúc trọn vẹn.
* **Kịch bản B: Chưa khắc phục triệt để (Yêu cầu làm lại - Rework):**
  1. Cư dân kiểm tra thấy lỗi vẫn tái diễn.
  2. Bấm nút **"Chưa khắc phục xong (Yêu cầu xử lý lại)"**.
  * **Kết quả:** Ticket từ `RESOLVED` bị đẩy quay ngược trở về **`IN_PROGRESS`** (`resolved_at = NULL`). Thợ 1 mở lại màn hình "Việc của tôi" sẽ thấy ticket quay trở lại để tiếp tục bảo hành xử lý.

---

### TC 5.5: Admin điều phối cưỡng bức sự cố quá hạn 24h
* **Mã Test Case:** `TC_ADMIN_FORCE_ASSIGN_TICKET`
* **Mục tiêu:** Ban quản lý can thiệp xử lý đối với sự cố quá hạn mà thợ không chủ động nhận việc.
* **Các bước thực hiện:**
  1. Đăng nhập tài khoản `ADMIN`, vào **Giám sát sự cố** (`/admin/tickets`).
  2. Lọc danh sách các sự cố quá hạn $> 24\text{h}$.
  3. Tại dòng sự cố cần điều phối, bấm nút **"Chỉ định thợ"**.
  4. Chọn kỹ thuật viên `Nguyễn Văn Thợ` trong Dropdown $\rightarrow$ Bấm **"Giao việc ngay"**.
* **Kết quả mong đợi:**
  * Ticket thoát khỏi trạng thái `OPEN`, chuyển thành **`IN_PROGRESS`**, gán `assigned_to = <thợ_được_chọn>`.
  * Ticket biến mất khỏi Chợ việc chung của toàn bộ kỹ thuật viên khác và bay thẳng vào danh mục "Việc của tôi" của người thợ vừa được chỉ định.

---

## 7. CHECKLIST TỔNG HỢP ĐÁNH GIÁ BÀN GIAO

| STT | Luồng Kiểm Thử | Trường Hợp Test Trọng Điểm | Kết Quả Đánh Giá |
| :---: | :--- | :--- | :---: |
| 1 | **Move-in** | Tạo tài khoản mới & tái kích hoạt tài khoản cũ (`is_active = 1`). | `PASS` |
| 2 | **Move-out** | **Chặn cứng dọn đi nếu còn nợ hóa đơn (`BR-04`)**. | `PASS` |
| 3 | **Move-out** | Xóa sạch phương tiện & Chuyển căn hộ về `VACANT`. | `PASS` |
| 4 | **Move-out** | Chỉ khóa tài khoản khi số căn hộ `OCCUPIED` còn lại bằng 0. | `PASS` |
| 5 | **Context Switch** | Chuyển đổi căn hộ hiển thị tức thì, không reload trang (`BR-02`). | `PASS` |
| 6 | **Meter Reading** | Loại bỏ hoàn toàn các căn `VACANT`, validate `mới >= cũ`. | `PASS` |
| 7 | **Billing Calculation** | Tính chuẩn tổng tiền gồm 4 mục (Điện + Nước + QL + Xe). | `PASS` |
| 8 | **VietQR** | Tạo mã QR động chuẩn VietQR có số tiền và mã hóa đơn. | `PASS` |
| 9 | **Reconciliation** | Gạch nợ Plan B: Duyệt (`PAID`) hoặc Từ chối (`UNPAID`). | `PASS` |
| 10 | **Task Pool** | Gắn nhãn đỏ cảnh báo sự cố quá hạn $> 24\text{ giờ}$. | `PASS` |
| 11 | **Atomic Claim** | Cập nhật nguyên tử chống tranh chấp khi 2 thợ cùng nhận việc (`409 Conflict`). | `PASS` |
| 12 | **Inspection** | Nghiệm thu đóng phiếu (1-5 sao) hoặc yêu cầu làm lại (`IN_PROGRESS`). | `PASS` |
