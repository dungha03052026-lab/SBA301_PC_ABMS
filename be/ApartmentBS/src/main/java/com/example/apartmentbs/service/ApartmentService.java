package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.ApartmentRequest;
import com.example.apartmentbs.dto.request.MoveInRequest;
import com.example.apartmentbs.dto.request.VehicleRequest;
import com.example.apartmentbs.dto.response.ApartmentResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.dto.response.VehicleResponse;
import com.example.apartmentbs.model.ApartmentStatus;

import java.math.BigDecimal;
import java.util.List;

/**
 * Giao diện dịch vụ quản lý Căn hộ, Cư dân và Phương tiện (Apartment Service).
 */
public interface ApartmentService {

    /**
     * Tìm kiếm và lọc danh sách căn hộ theo nhiều tiêu chí (không phân trang).
     */
    List<ApartmentResponse> searchApartments(
            String buildingBlock,
            Integer floor,
            ApartmentStatus status,
            BigDecimal minArea,
            BigDecimal maxArea,
            String search
    );

    /**
     * Tìm kiếm căn hộ có phân trang và sắp xếp.
     */
    PageResponse<ApartmentResponse> searchApartmentsPaged(
            String buildingBlock,
            Integer floor,
            ApartmentStatus status,
            BigDecimal minArea,
            BigDecimal maxArea,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    /**
     * Lấy thông tin căn hộ theo ID.
     */
    ApartmentResponse getApartmentById(Long id);

    /**
     * Thêm mới một căn hộ vật lý.
     */
    ApartmentResponse createApartment(ApartmentRequest request);

    /**
     * Cập nhật thông tin căn hộ vật lý.
     */
    ApartmentResponse updateApartment(Long id, ApartmentRequest request);

    /**
     * Xóa căn hộ (chỉ khi ở trạng thái VACANT).
     */
    void deleteApartment(Long id);

    /**
     * Tiếp nhận cư dân dọn vào ở (Move-in - UC-05).
     */
    ApartmentResponse moveIn(Long id, MoveInRequest request);

    /**
     * Bàn giao cư dân dọn đi (Move-out - UC-06).
     * Ràng buộc BR-04: Chặn nếu còn nợ hóa đơn; khóa tài khoản nếu không còn căn khác.
     */
    ApartmentResponse moveOut(Long id);

    /**
     * Lấy danh sách phương tiện của căn hộ.
     */
    List<VehicleResponse> getVehiclesByApartment(Long apartmentId);

    /**
     * Đăng ký thêm phương tiện cho căn hộ.
     */
    VehicleResponse addVehicle(Long apartmentId, VehicleRequest request);

    /**
     * Hủy đăng ký phương tiện của căn hộ.
     */
    void deleteVehicle(Long apartmentId, Long vehicleId);

    /**
     * Lấy danh sách căn hộ theo ID của cư dân (Hỗ trợ 1-N).
     */
    List<ApartmentResponse> getApartmentsByResident(Long residentId);

    /**
     * Lấy danh sách tài khoản cư dân.
     */
    List<UserResponse> getResidents();

    /**
     * Lấy danh sách tài khoản kỹ thuật viên.
     */
    List<UserResponse> getTechnicians();
}
