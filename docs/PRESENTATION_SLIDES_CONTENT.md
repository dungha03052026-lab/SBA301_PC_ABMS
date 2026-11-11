# APARTMENT BUILDING MANAGEMENT SYSTEM (ABMS)
## OFFICIAL 13-SLIDE PRESENTATION SPECIFICATION & SPEAKER SCRIPT

> **Course:** Fullstack Java Web (Spring Boot + ReactJS)  
> **Instructor:** Nguyen Thi Dieu (FE FPTU HN)  
> **Presentation Duration:** 25 mins presentation + live demo | 10–15 mins Q&A  
> **Language on Slides:** English (Tiếng Anh)  
> **Scope:** Comprehensive coverage of 100% project requirements (Actors, Use Cases, Architecture, Work Division)  

---

### SLIDE 1: TITLE & TEAM INTRODUCTION
* **Visual Layout:** Logo FPTU, giao diện Dashboard chụp thu nhỏ, thẻ thông tin thành viên.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  APARTMENT BUILDING MANAGEMENT SYSTEM (ABMS)
  A Full-stack Single-Building Operations & Living Hub

  Subject: Fullstack Java Web (Spring Boot + ReactJS)
  Instructor: Nguyen Thi Dieu (FE FPTU HN)

  TEAM MEMBERS & RESPONSIBILITIES:
  • Member 1 (Lead Developer / Full-stack): Backend Core, Security & System Architecture
  • Member 2 (Developer / Frontend): React SPA, UI/UX Components & State Management
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Kính chào cô Điệu và các bạn. Hôm nay nhóm em xin phép được báo cáo đồ án môn Fullstack Java Web với đề tài: **ABMS - Hệ thống Quản lý và Vận hành Chung cư Đơn khối**. Dự án được xây dựng trên nền tảng Spring Boot và ReactJS nhằm giải quyết bài toán chuyển đổi số khép kín trong vận hành tòa nhà. Nhóm chúng em gồm 2 thành viên chịu trách nhiệm xuyên suốt từ thiết kế kiến trúc, CSDL đến triển khai Full-stack."*

---

### SLIDE 2: PROBLEM STATEMENT & PROJECT OBJECTIVES
* **Visual Layout:** 2 cột so sánh: Bên trái "Traditional Handaches" (icon đỏ), bên phải "ABMS Solutions" (icon xanh).
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  PROBLEM STATEMENT & SYSTEM GOALS

  THE CHALLENGES (Traditional Management):
  • Manual paperwork for resident move-in / move-out procedures.
  • Complex multi-factor utility calculation (electric, water, parking, management fees).
  • Lost maintenance requests and delayed issue resolutions.
  • Fragmented communication channels between residents and building staff.

  THE ABMS SOLUTION:
  • Centralized single-building management platform with strict business rule validation.
  • Automated utility meter billing with dynamic VietQR instant payment.
  • Real-time Maintenance Task Pool with 24-hour SLA alert & atomic conflict-free ticket claiming.
  • Transparent, role-based contextual user experiences.
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Trước đây, việc quản lý tòa nhà thủ công thường gây thất thoát công nợ, nhầm lẫn số điện nước và chậm trễ sửa chữa sự cố. ABMS ra đời như một giải pháp toàn diện: tự động hóa tính hóa đơn, tích hợp VietQR động, và áp dụng mô hình Chợ việc kỹ thuật có cơ chế chống tranh chấp công việc theo thời gian thực."*

---

### SLIDE 3: SYSTEM ACTORS & ROLE PERMISSIONS
* **Visual Layout:** 3 thẻ User Cards (Admin, Resident, Technician) kèm icon và danh sách quyền hạn.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  SYSTEM ACTORS & RBAC (ROLE-BASED ACCESS CONTROL)

  1. BUILDING ADMIN (Ban Quản Lý):
     • Manage apartment inventory (status, floors, dimensions).
     • Handle Resident Move-in & Debt-validated Move-out workflows.
     • Batch utility meter entry & monthly invoice generation.
     • Bank reconciliation & manual payment approval/rejection.
     • Oversee maintenance tickets & force-assign overdue tasks (>24h).

  2. RESIDENT (Cư Dân / Chủ Hộ):
     • Context Switch between multiple owned apartments seamlessly.
     • View monthly utility breakdown & scan dynamic VietQR.
     • Submit maintenance requests with category, photos, and descriptions.
     • Accept completed repairs and give 1–5 star service ratings.

  3. TECHNICIAN (Nhân Viên Kỹ Thuật):
     • Access the open Maintenance Task Pool with urgent 24h overdue badges.
     • Atomically claim tickets (zero race condition).
     • Update technical inspection notes & mark issues as RESOLVED.
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Hệ thống phục vụ 3 tác nhân cốt lõi. Ban Quản trị kiểm soát toàn bộ tài sản, công nợ và điều phối. Cư dân có thể đại diện cho nhiều căn hộ cùng lúc nhờ cơ chế Context Switch. Đội ngũ Kỹ thuật viên thao tác trên một Chợ việc chung để nhận và hoàn tất sửa chữa minh bạch."*

---

### SLIDE 4: CORE BUSINESS RULES (SRS HIGHLIGHTS)
* **Visual Layout:** Sơ đồ 4 khối logic trọng tâm: `BR-02`, `BR-04`, `BR-05`, `BR-07`.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  CORE BUSINESS RULES ENGINE

  • BR-01 & BR-02 (Apartment Context Switch):
    1 Resident can own N Apartments. Resident views dynamically filter by the selected apartment context.

  • BR-04 (Move-out Debt Blocking):
    Hard-blocks move-out if unpaid/pending invoices exist. Soft-disables account only when the resident owns 0 active apartments.

  • BR-05 (Deterministic Monthly Billing):
    Invoices strictly skip vacant units. Total = Electricity + Water + Management Fee + (Motorbike × Fee) + (Car × Fee).

  • BR-06 (VietQR Life-cycle & Plan B Reconciliation):
    Status: UNPAID → PENDING (resident clicks 'I have transferred') → PAID (Admin confirms statement).

  • BR-07 (Atomic Task Pool & 24h SLA Alert):
    Tickets open for >24 hours trigger red alert tags. Atomic DB update prevents double-claiming race conditions.
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Điểm khác biệt của dự án là tuân thủ nghiêm ngặt 7 Business Rules: Move-out bắt buộc chặn nợ nếu còn hóa đơn chưa thanh toán; công thức tính tiền điện nước tự động bóc tách số xe; và luồng nhận việc kỹ thuật có cơ chế chống xung đột tại Database."*

---

### SLIDE 5: USE CASES TAXONOMY (20 USE CASES ACROSS 5 MODULES)
* **Visual Layout:** Ma trận bảng chia 5 cột (5 Phân hệ) liệt kê từ UC-01 đến UC-20.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  SYSTEM USE CASE TAXONOMY (20 USE CASES)

  [Module 1: Auth & Context]
  • UC-01: System Login (JWT + BCrypt)
  • UC-02: Change Password
  • UC-03: Resident Apartment Context Switch

  [Module 2: Apartment & Resident]
  • UC-04: Apartment Management & Dynamic Filter
  • UC-05: Resident Move-in & Auto-registration
  • UC-06: Resident Move-out & Debt Clearance Check
  • UC-07: Vehicle Registration by Apartment

  [Module 3: Billing & Payments]
  • UC-08: Service Tariff Configuration
  • UC-09: Meter Reading & Batch Invoicing
  • UC-10: Resident Invoice History & Breakdown
  • UC-11: VietQR Payment & Confirmation
  • UC-12: Manual Bank Statement Reconciliation

  [Module 4: Maintenance & Task Pool]
  • UC-13: Create Maintenance Ticket
  • UC-14: Task Pool Browsing & 24h SLA Warning
  • UC-15: Atomic Ticket Claiming
  • UC-16: Progress Update & Resolution
  • UC-17: Quality Acceptance & 1–5 Star Rating
  • UC-18: Admin Overdue Ticket Force-assignment

  [Module 5: Announcements]
  • UC-19: Post & Pin Building Announcements
  • UC-20: View Announcements Feed
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Hệ thống được module hóa thành 5 phân hệ với tổng cộng 20 Use Cases khép kín, từ khâu quản lý mặt bằng, cư dân vào/ra, tính toán hóa đơn đến xử lý sự cố kỹ thuật và truyền thông nội bộ."*

---

### SLIDE 6: CRITICAL WORKFLOWS (FLOWCHART VISUALIZATION)
* **Visual Layout:** 2 luồng Flowchart song song: Hóa đơn VietQR và Sự cố Task Pool.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  END-TO-END BUSINESS WORKFLOWS

  1. INVOICE & VIETQR PAYMENT LIFECYCLE:
     Admin Enters Meters → System Calculates & Generates Invoices (UNPAID)
     → Resident Scans VietQR & Clicks 'Paid' (PENDING)
     → Admin Checks Bank Statement → Approve (PAID) / Reject (UNPAID)

  2. MAINTENANCE TASK POOL & SLA LIFECYCLE:
     Resident Submits Ticket (OPEN)
     → SLA Engine Checks Age (>24h? Add Urgent Red Flag)
     → Technician Claims Ticket via Atomic Lock (IN_PROGRESS)
     → Technician Enters Notes & Marks Complete (RESOLVED)
     → Resident Inspects & Rates 1–5 Stars (CLOSED)
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Hai luồng quy trình phức tạp nhất trong tòa nhà được chuẩn hóa tự động: Luồng hóa đơn đi qua 3 trạng thái UNPAID - PENDING - PAID đảm bảo chống gian lận chuyển khoản; Luồng sự cố áp dụng cơ chế nghiệm thu dịch vụ kèm đánh giá sao từ chính cư dân."*

---

### SLIDE 7: SYSTEM ARCHITECTURE (N-LAYER BACKEND & MODULAR FRONTEND)
* **Visual Layout:** Sơ đồ khối kiến trúc N-Layer (Client ↔ Presentation ↔ Service ↔ Persistence ↔ Database).
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  SYSTEM ARCHITECTURE DESIGN

  CLIENT LAYER:
  • Single Page Application (ReactJS 19 + Vite + Ant Design)
  • Role-based Routing with Protected Route Guards
  • Unified Axios Client with JWT Interceptors & Cross-Role LocalStorage Sync

  BACKEND LAYER (Spring Boot 3.4.2 N-Tier):
  • Presentation Layer: REST Controllers with @Valid DTO validation
  • Security Layer: Stateless Spring Security Filter Chain + JWT Provider
  • Business Layer: Transactional Services enforcing strict domain rules
  • Data Access Layer: Spring Data JPA + JPA Criteria Specification Executor

  PERSISTENCE LAYER:
  • Microsoft SQL Server (ACID compliant, relational integrity, constraints)
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Về mặt kiến trúc, dự án áp dụng mô hình N-Layer kinh điển kết hợp Clean RESTful API. Phía Backend tách biệt rõ ràng Controller, Service, Repository và Security Filter. Phía Frontend cấu trúc theo Role-based Modular, giao tiếp thông qua JWT Bearer Header trên Axios."*

---

### SLIDE 8: DATABASE DESIGN (7 NORMALIZED TABLES)
* **Visual Layout:** Sơ đồ ERD rút gọn thể hiện mối quan hệ giữa 7 bảng.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  RELATIONAL DATABASE DESIGN (7 COMPACT TABLES)

  1. `users`: Stores Admin, Resident, and Technician accounts (BCrypt hashed).
  2. `apartments`: 1-N relation with `users` (resident_id), tracking floor, block, area, and status.
  3. `vehicles`: Cascade linked to `apartments`, categorized into MOTORBIKE & CAR.
  4. `service_tariffs`: Singleton record (id=1) storing unit prices for billing calculations.
  5. `invoices`: Monthly bills with meter readings, unique per apartment/month.
  6. `tickets`: Maintenance reports tracking status, category, resolution notes, and ratings.
  7. `announcements`: Bulletin board items with pinned priority flag.

  INTEGRITY HIGHLIGHTS:
  • Check constraints: Non-negative fees, new_meter >= old_meter, rating between 1 and 5.
  • Unique indexes: room_number, license_plate, invoice_code, ticket_code.
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Toàn bộ hệ thống được chuẩn hóa tối ưu trong đúng 7 bảng CSDL SQL Server, loại bỏ bảng trung gian dư thừa nhưng vẫn đáp ứng hoàn hảo quan hệ 1 Cư dân sở hữu nhiều Căn hộ. Các ràng buộc Check Constraint được đặt trực tiếp ở mức CSDL để bảo vệ toàn vẹn dữ liệu."*

---

### SLIDE 9: KEY TECHNICAL HIGHLIGHTS & INNOVATIONS
* **Visual Layout:** 2 ô kỹ thuật so sánh Code Snippet: Lọc Specification và Update nguyên tử.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  CORE TECHNICAL IMPLEMENTATIONS

  1. JPA CRITERIA SPECIFICATION (Dynamic Filtering):
     • Solves the "Combinatorial Explosion" problem of static query methods.
     • Atomic Predicates: hasBuildingBlock, hasFloor, hasStatus, areaBetween, searchGeneral.
     • Safe multi-field searching via LEFT JOIN (apartments ⟕ users) to preserve vacant rooms.
     • 100% immune to SQL Injection via parameterized queries.

  2. CONCURRENCY CONTROL (Atomic Ticket Claiming):
     • Solves race conditions when multiple technicians claim the same ticket simultaneously.
     • Implemented via `@Modifying @Query` with conditional atomic update:
       UPDATE tickets SET status = 'IN_PROGRESS', assigned_to = :techId 
       WHERE id = :ticketId AND status = 'OPEN'
     • Returns HTTP 409 Conflict if already claimed by another worker.
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Về kỹ thuật nâng cao, nhóm em áp dụng Specification Pattern của JPA Criteria API để giải quyết bài toán bùng nổ số lượng hàm tìm kiếm động, kết hợp LEFT JOIN để không bị mất phòng trống. Đồng thời, hàm nhận việc được khóa nguyên tử bằng câu lệnh UPDATE có điều kiện, ngăn chặn tuyệt đối lỗi Race Condition khi nhiều thợ cùng bấm nhận một sự cố."*

---

### SLIDE 10: TECHNOLOGY STACK & TOOLING
* **Visual Layout:** Lưới các biểu tượng công nghệ chia theo Backend, Frontend, Database, Tools.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  COMPREHENSIVE TECHNOLOGY STACK

  BACKEND TECH:
  • Java 17 / 21 & Spring Boot 3.4.2
  • Spring Data JPA & Hibernate ORM
  • Spring Security & JJWT (io.jsonwebtoken 0.12.6)
  • Bean Validation (Jakarta Validation)

  FRONTEND TECH:
  • ReactJS 19 & Vite Bundler
  • Ant Design (v5) & React-Bootstrap
  • React Router DOM v7 & Axios Client

  DATABASE & SERVICES:
  • Microsoft SQL Server 2019/2022
  • VietQR API Integration (Dynamic Payload Banking QR)

  DEVELOPMENT & QA TOOLS:
  • IntelliJ IDEA, VS Code, Git/GitHub, Postman, JUnit 5 / AssertJ
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Dự án sử dụng Tech Stack hiện đại nhất hiện nay: Spring Boot 3.4 kết hợp React 19 và Ant Design. Nhóm tận dụng VietQR API chuẩn quốc gia để tạo trải nghiệm quét mã chuyển khoản tức thì cho cư dân mà không cần cổng thanh toán trung gian tốn phí."*

---

### SLIDE 11: WORK DIVISION & DEVELOPMENT TIMELINE
* **Visual Layout:** Bảng phân chia công việc minh bạch và các mốc Sprint.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  WORK ALLOCATION & CONTRIBUTION MATRIX

  SPRINT TIMELINE (3 WEEKS):
  • Week 1: Requirements analysis, SRS specification, DB schema & UI Mockups.
  • Week 2: Core backend APIs, Security/JWT, and modular React frontend development.
  • Week 3: API integration, End-to-End testing, edge-case validation & deployment prep.

  RESPONSIBILITY BREAKDOWN (50% - 50% COLLABORATION):
  • Backend Engineer:
    - DB Migration (7 Tables) & JPA Entities
    - Spring Security + JWT Stateless Authentication
    - 20 REST API Endpoints & Business Rule Validation
    - JPA Criteria Specification & Concurrency Lock
  • Frontend Engineer:
    - React Router Setup & Protected Route Guards
    - Admin, Resident & Technician Layouts & UI Screens
    - Context Switch Engine & VietQR Render Component
    - Cross-Role Mock Sync & Axios API Interceptors
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Dự án được triển khai trong vòng 3 tuần với sự phân chia đồng đều 50-50 giữa 2 thành viên. Backend phụ trách toàn bộ 7 thực thể, bảo mật JWT, 20 APIs và các thuật toán kiểm tra nghiệp vụ. Frontend đảm nhiệm toàn bộ giao diện 3 phân hệ, bộ lọc động, cơ chế chuyển ngữ cảnh căn hộ và tích hợp API."*

---

### SLIDE 12: QUALITY ASSURANCE & TESTING STRATEGY
* **Visual Layout:** Ảnh chụp màn hình kết quả chạy Unit Test & Integration Test (100% Passed).
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  QUALITY ASSURANCE & TESTING STRATEGY

  AUTOMATED TEST SUITE:
  • `ApartmentSpecificationTest`: 5/5 PASSED
    - Validates building block, status, area range, composite filters, and LEFT JOIN keyword queries.
  • `AllUseCasesIntegrationTest`: 20/20 PASSED
    - End-to-end integration test validating the complete lifecycle of all 20 Use Cases.
  • `ApartmentServiceIntegrationTest`: PASSED
    - Tests apartment inventory CRUD and multi-vehicle associations.

  CODE QUALITY PRINCIPLES:
  • Zero White-Screen Policy: Comprehensive guard clauses on frontend rendering.
  • Fail-Fast Bean Validation: HTTP 400 Bad Request with precise error details.
  • Safe Data Rollback: All integration test fixtures run under @Transactional boundaries.
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Về mặt chất lượng, nhóm áp dụng phương pháp kiểm thử TDD. Bộ test tự động gồm ApartmentSpecificationTest và AllUseCasesIntegrationTest đều đạt 100% tỷ lệ pass, đảm bảo mọi luồng nghiệp vụ từ Move-in, Move-out đến chốt hóa đơn hoạt động chính xác trước khi đưa lên giao diện."*

---

### SLIDE 13: CONCLUSION, DEMO READINESS & Q&A
* **Visual Layout:** Tóm tắt 3 thế mạnh lớn nhất, dòng chữ "Thank You & Q&A" nổi bật.
* **SLIDE CONTENT (Put on Slide - English):**
  ```text
  CONCLUSION & DEMO TRANSITION

  PROJECT ACHIEVEMENTS:
  ✓ 100% Compliance with SRS Guidelines and 20 Use Case specifications.
  ✓ Robust Full-stack integration: Spring Boot 3 + React 19 + SQL Server.
  ✓ Production-ready features: VietQR payments, dynamic JPA filtering, atomic task pool.
  ✓ Scalable and maintainable code architecture following SOLID principles.

  READY FOR LIVE DEMONSTRATION & Q&A SESSION!
  Thank you for your attention!
  ```
* **SPEAKER NOTES (Lời thoại thuyết minh):**
  > *"Tóm lại, dự án ABMS đã hoàn thành đầy đủ 100% mục tiêu đề ra với kiến trúc vững chắc và trải nghiệm người dùng mượt mà. Sau đây, nhóm em xin phép bước vào phần Demo trực tiếp các luồng vận hành trên hệ thống. Xin cảm ơn cô và các bạn đã lắng nghe!"*
