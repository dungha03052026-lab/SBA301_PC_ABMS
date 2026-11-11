package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Apartment;
import com.example.apartmentbs.model.ApartmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu cho thực thể Căn hộ (Apartment).
 */
@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long>, JpaSpecificationExecutor<Apartment> {

    /**
     * Tìm căn hộ theo số phòng (Ví dụ: A-101, B-1205).
     */
    Optional<Apartment> findByRoomNumber(String roomNumber);

    /**
     * Kiểm tra sự tồn tại của số phòng trên hệ thống.
     */
    boolean existsByRoomNumber(String roomNumber);

    /**
     * Lấy toàn bộ danh sách căn hộ mà cư dân đang sở hữu (Quan hệ 1-N).
     */
    List<Apartment> findByResidentId(Long residentId);

    /**
     * Lấy danh sách căn hộ theo cư dân và trạng thái (Ví dụ: OCCUPIED).
     */
    List<Apartment> findByResidentIdAndStatus(Long residentId, ApartmentStatus status);

    /**
     * Đếm số lượng căn hộ đang ở (OCCUPIED) của cư dân (dùng cho kiểm tra khóa tài khoản BR-04).
     */
    long countByResidentIdAndStatus(Long residentId, ApartmentStatus status);

    /**
     * Lấy danh sách căn hộ theo trạng thái (VACANT / OCCUPIED).
     */
    List<Apartment> findByStatus(ApartmentStatus status);
}
