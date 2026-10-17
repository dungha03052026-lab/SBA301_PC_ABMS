-- ====================================================================
-- Script: Apartment Building Management System (MSSQL)
-- Database: ApartmentDB
-- Scope: 7 Tables (Users, Apartments, Vehicles, Tariffs, Invoices, Tickets, Announcements)
-- ====================================================================

-- 1. TẠO DATABASE (NẾU CHƯA CÓ)
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'ApartmentDB')
BEGIN
    CREATE DATABASE ApartmentDB;
END
GO

USE ApartmentDB;
GO

-- ====================================================================
-- 2. DROP BẢNG THEO THỨ TỰ RÀNG BUỘC (NẾU ĐÃ TỒN TẠI ĐỂ CHẠY LẠI ĐƯỢC)
-- ====================================================================
IF OBJECT_ID('dbo.announcements', 'U') IS NOT NULL DROP TABLE dbo.announcements;
IF OBJECT_ID('dbo.tickets', 'U') IS NOT NULL DROP TABLE dbo.tickets;
IF OBJECT_ID('dbo.invoices', 'U') IS NOT NULL DROP TABLE dbo.invoices;
IF OBJECT_ID('dbo.vehicles', 'U') IS NOT NULL DROP TABLE dbo.vehicles;
IF OBJECT_ID('dbo.apartments', 'U') IS NOT NULL DROP TABLE dbo.apartments;
IF OBJECT_ID('dbo.service_tariffs', 'U') IS NOT NULL DROP TABLE dbo.service_tariffs;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- ====================================================================
-- 3. TẠO CÁC BẢNG CƠ SỞ DỮ LIỆU
-- ====================================================================

-- BẢNG 1: USERS (Tài khoản người dùng: Admin, Resident, Technician)
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_users_role CHECK (role IN ('ADMIN', 'RESIDENT', 'TECHNICIAN'))
);
GO

-- BẢNG 2: APARTMENTS (Quản lý căn hộ & quan hệ 1-N với Resident)
CREATE TABLE dbo.apartments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    room_number VARCHAR(20) NOT NULL UNIQUE,
    floor INT NOT NULL,
    building_block NVARCHAR(20) NOT NULL,
    area_sqm DECIMAL(6,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'VACANT',
    resident_id BIGINT NULL,
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_apartments_status CHECK (status IN ('VACANT', 'OCCUPIED')),
    CONSTRAINT FK_apartments_resident FOREIGN KEY (resident_id) 
        REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO

-- BẢNG 3: VEHICLES (Phương tiện đăng ký theo căn hộ để tính phí gửi xe)
CREATE TABLE dbo.vehicles (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL,
    owner_name NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_vehicles_type CHECK (vehicle_type IN ('MOTORBIKE', 'CAR')),
    CONSTRAINT FK_vehicles_apartment FOREIGN KEY (apartment_id) 
        REFERENCES dbo.apartments(id) ON DELETE CASCADE
);
GO

-- BẢNG 4: SERVICE_TARIFFS (Bảng đơn giá dịch vụ - Giữ duy nhất 1 dòng cấu hình)
CREATE TABLE dbo.service_tariffs (
    id INT PRIMARY KEY DEFAULT 1,
    management_fee_per_sqm DECIMAL(12,2) NOT NULL,
    electricity_unit_price DECIMAL(12,2) NOT NULL,
    water_unit_price DECIMAL(12,2) NOT NULL,
    motorbike_fee DECIMAL(12,2) NOT NULL,
    car_fee DECIMAL(12,2) NOT NULL,
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_service_tariffs_single_row CHECK (id = 1)
);
GO

-- BẢNG 5: INVOICES (Hóa đơn dịch vụ hàng tháng - Plan B duyệt thủ công 3 trạng thái)
CREATE TABLE dbo.invoices (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
    apartment_id BIGINT NOT NULL,
    billing_month VARCHAR(7) NOT NULL, -- Định dạng YYYY-MM
    old_electric_num INT NOT NULL,
    new_electric_num INT NOT NULL,
    old_water_num INT NOT NULL,
    new_water_num INT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    due_date DATE NOT NULL,
    paid_at DATETIME2 NULL,
    approved_by BIGINT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT CK_invoices_status CHECK (status IN ('UNPAID', 'PENDING', 'PAID')),
    CONSTRAINT CK_invoices_electric CHECK (new_electric_num >= old_electric_num),
    CONSTRAINT CK_invoices_water CHECK (new_water_num >= old_water_num),
    CONSTRAINT FK_invoices_apartment FOREIGN KEY (apartment_id) 
        REFERENCES dbo.apartments(id),
    CONSTRAINT FK_invoices_approved_by FOREIGN KEY (approved_by) 
        REFERENCES dbo.users(id)
);
GO

-- BẢNG 6: TICKETS (Tiếp nhận sự cố & Chợ việc chung Task Pool)
CREATE TABLE dbo.tickets (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    ticket_code VARCHAR(30) NOT NULL UNIQUE,
    apartment_id BIGINT NOT NULL,
    resident_id BIGINT NOT NULL,
    category VARCHAR(30) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    image_url VARCHAR(MAX) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    assigned_to BIGINT NULL,
    technician_note NVARCHAR(MAX) NULL,
    rating INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    resolved_at DATETIME2 NULL,

    CONSTRAINT CK_tickets_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    CONSTRAINT CK_tickets_category CHECK (category IN ('ELECTRIC', 'PLUMBING', 'OTHER')),
    CONSTRAINT CK_tickets_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    CONSTRAINT FK_tickets_apartment FOREIGN KEY (apartment_id) 
        REFERENCES dbo.apartments(id),
    CONSTRAINT FK_tickets_resident FOREIGN KEY (resident_id) 
        REFERENCES dbo.users(id),
    CONSTRAINT FK_tickets_technician FOREIGN KEY (assigned_to) 
        REFERENCES dbo.users(id)
);
GO

-- BẢNG 7: ANNOUNCEMENTS (Bản tin thông báo tòa nhà)
CREATE TABLE dbo.announcements (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    created_by BIGINT NOT NULL,
    is_pinned BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_announcements_admin FOREIGN KEY (created_by) 
        REFERENCES dbo.users(id)
);
GO

-- ====================================================================
-- 4. TẠO INDEX ĐỂ TỐI ƯU TRUY VẤN
-- ====================================================================
CREATE INDEX IX_apartments_resident_id ON dbo.apartments(resident_id);
CREATE INDEX IX_invoices_apartment_status ON dbo.invoices(apartment_id, status);
CREATE INDEX IX_tickets_status_assigned ON dbo.tickets(status, assigned_to);
GO

-- ====================================================================
-- 5. SEED DATA MẪU (SẴN SÀNG CHO DEV TEST NGAY)
-- ====================================================================

-- 5.1. Tạo cấu hình đơn giá
INSERT INTO dbo.service_tariffs (id, management_fee_per_sqm, electricity_unit_price, water_unit_price, motorbike_fee, car_fee)
VALUES (1, 10000.00, 3500.00, 15000.00, 100000.00, 1200000.00);

-- 5.2. Tạo tài khoản người dùng mẫu (Admin, Resident, Technician)
-- Mật khẩu mẫu băm giả lập: $2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW (password: 123456)
INSERT INTO dbo.users (phone_number, email, password_hash, full_name, role, is_active)
VALUES 
('0901000001', 'admin@building.vn', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', N'Trưởng Ban Quản Lý', 'ADMIN', 1),
('0902000001', 'tech1@building.vn', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', N'Nguyễn Văn Thợ (Điện Nước)', 'TECHNICIAN', 1),
('0903000001', 'resident.dung@gmail.com', '$2a$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', N'Hồ Anh Dũng', 'RESIDENT', 1);

-- 5.3. Tạo danh mục căn hộ (User 3 sở hữu 2 căn để test Switch Context)
INSERT INTO dbo.apartments (room_number, floor, building_block, area_sqm, status, resident_id)
VALUES 
('A-101', 1, N'Tòa A', 75.50, 'OCCUPIED', 3), -- Căn 1 của User 3
('B-502', 5, N'Tòa B', 68.00, 'OCCUPIED', 3), -- Căn 2 của User 3 (Test nhiều căn)
('A-102', 1, N'Tòa A', 75.50, 'VACANT', NULL);  -- Căn trống

-- 5.4. Đăng ký phương tiện cho căn hộ A-101
INSERT INTO dbo.vehicles (apartment_id, license_plate, vehicle_type, owner_name)
VALUES 
(1, '30A-999.88', 'CAR', N'Hồ Anh Dũng'),
(1, '29X1-123.45', 'MOTORBIKE', N'Hồ Anh Dũng');

-- 5.5. Tạo hóa đơn mẫu cho căn A-101
INSERT INTO dbo.invoices (invoice_code, apartment_id, billing_month, old_electric_num, new_electric_num, old_water_num, new_water_num, total_amount, status, due_date)
VALUES 
('INV-202610-A101', 1, '2026-10', 100, 180, 20, 28, 2395000.00, 'UNPAID', '2026-10-25');

-- 5.6. Tạo ticket sự cố mẫu đang ở Task Pool (status = OPEN)
INSERT INTO dbo.tickets (ticket_code, apartment_id, resident_id, category, title, description, status)
VALUES 
('TCK-202610-001', 1, 3, 'PLUMBING', N'Rò rỉ nước bồn rửa bát', N'Ống xả dưới bồn rửa bị nứt, rỉ nước ra sàn bếp', 'OPEN');

-- 5.7. Tạo thông báo chung
INSERT INTO dbo.announcements (title, content, created_by, is_pinned)
VALUES 
(N'Thông báo lịch bảo trì thang máy Tòa A', N'Ban quản lý xin thông báo tạm dừng thang máy số 2 Tòa A từ 13h-17h ngày Chủ nhật để bảo dưỡng định kỳ.', 1, 1);
GO