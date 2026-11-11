package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Vehicle;
import com.example.apartmentbs.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy vấn dữ liệu cho thực thể Phương tiện gửi xe (Vehicle).
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Lấy danh sách toàn bộ phương tiện thuộc về một căn hộ.
     */
    List<Vehicle> findByApartmentId(Long apartmentId);

    /**
     * Kiểm tra biển số xe đã tồn tại trong hệ thống tòa nhà chưa (chống trùng lặp).
     */
    boolean existsByLicensePlate(String licensePlate);

    /**
     * Đếm số lượng xe theo loại (MOTORBIKE / CAR) để tính phí gửi xe hàng tháng (BR-05).
     */
    long countByApartmentIdAndVehicleType(Long apartmentId, VehicleType vehicleType);

    /**
     * Xóa sạch các phương tiện của căn hộ khi làm thủ tục chuyển đi (Move-out - UC-06).
     */
    void deleteByApartmentId(Long apartmentId);
}
