package com.example.apartmentbs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Lớp khởi chạy ứng dụng Spring Boot - Apartment Building Management System (ABMS).
 * 
 * Hệ thống quản lý tòa nhà chung cư bao gồm các phân hệ:
 * - Quản lý căn hộ và cư dân (Apartment & Resident Management, Move-in / Move-out BR-04)
 * - Quản lý dịch vụ và hóa đơn hàng tháng (Service Tariffs, Meter Reading, Batch Invoicing, Approvals)
 * - Tiếp nhận và điều phối sự cố bảo trì tòa nhà (Ticket Lifecycle, Inspection, Rating)
 * - Quản lý thông báo tòa nhà (Announcements)
 * - Xác thực và phân quyền dựa trên JWT theo 3 vai trò: ADMIN, RESIDENT, TECHNICIAN
 */
@SpringBootApplication
public class ApartmentBsApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApartmentBsApplication.class, args);
    }
}
