package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.ApartmentRequest;
import com.example.apartmentbs.dto.request.MoveInRequest;
import com.example.apartmentbs.dto.request.VehicleRequest;
import com.example.apartmentbs.dto.response.*;
import com.example.apartmentbs.model.ApartmentStatus;
import com.example.apartmentbs.service.ApartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST Controller quản lý thông tin Căn hộ, Cư dân và Phương tiện dành riêng cho Ban Quản Lý (Admin).
 * 
 * Các nhóm chức năng chính:
 * - Tra cứu và lọc căn hộ đa tiêu chí có phân trang / không phân trang.
 * - Thêm mới, cập nhật, xóa thông tin vật lý căn hộ.
 * - Thủ tục dọn vào (Move-in) và gán cư dân (hỗ trợ cư dân sở hữu nhiều căn hộ BR-02).
 * - Thủ tục dọn đi (Move-out) kiểm tra công nợ (BR-04) và khóa mềm tài khoản nếu không còn căn khác.
 * - Quản lý phương tiện gửi xe gắn liền với căn hộ (Ô tô, Xe máy).
 * - Lấy danh sách cư dân và kỹ thuật viên phục vụ dropdown giao diện.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ApartmentController {

    private final ApartmentService apartmentService;

    /**
     * Tra cứu danh sách căn hộ có phân trang và sắp xếp (Hỗ trợ bộ lọc động: Tòa, Tầng, Trạng thái, Diện tích, Từ khóa).
     */
    @GetMapping("/apartments")
    public ResponseEntity<ApiResponse<PageResponse<ApartmentResponse>>> searchApartments(
            @RequestParam(required = false) String buildingBlock,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) ApartmentStatus status,
            @RequestParam(required = false) BigDecimal minArea,
            @RequestParam(required = false) BigDecimal maxArea,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        PageResponse<ApartmentResponse> result = apartmentService.searchApartmentsPaged(
                buildingBlock, floor, status, minArea, maxArea, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Lấy toàn bộ danh sách căn hộ theo bộ lọc không phân trang (dùng cho xuất báo cáo, chọn dropdown).
     */
    @GetMapping("/apartments/all")
    public ResponseEntity<ApiResponse<List<ApartmentResponse>>> getAllApartments(
            @RequestParam(required = false) String buildingBlock,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) ApartmentStatus status,
            @RequestParam(required = false) BigDecimal minArea,
            @RequestParam(required = false) BigDecimal maxArea,
            @RequestParam(required = false) String search
    ) {
        List<ApartmentResponse> result = apartmentService.searchApartments(
                buildingBlock, floor, status, minArea, maxArea, search
        );
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Lấy thông tin chi tiết một căn hộ theo ID.
     */
    @GetMapping("/apartments/{id}")
    public ResponseEntity<ApiResponse<ApartmentResponse>> getApartmentById(@PathVariable Long id) {
        ApartmentResponse result = apartmentService.getApartmentById(id);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * Thêm mới một căn hộ vào hệ thống (Mặc định trạng thái VACANT - Trống).
     */
    @PostMapping("/apartments")
    public ResponseEntity<ApiResponse<ApartmentResponse>> createApartment(
            @Valid @RequestBody ApartmentRequest request
    ) {
        ApartmentResponse result = apartmentService.createApartment(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo căn hộ thành công", result));
    }

    /**
     * Cập nhật thông tin thông số vật lý của căn hộ (Số phòng, Tòa, Tầng, Diện tích).
     */
    @PutMapping("/apartments/{id}")
    public ResponseEntity<ApiResponse<ApartmentResponse>> updateApartment(
            @PathVariable Long id,
            @Valid @RequestBody ApartmentRequest request
    ) {
        ApartmentResponse result = apartmentService.updateApartment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin căn hộ thành công", result));
    }

    /**
     * Xóa căn hộ khỏi hệ thống.
     * Lưu ý: Căn hộ đang có người ở (OCCUPIED) không được phép xóa trực tiếp.
     */
    @DeleteMapping("/apartments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa căn hộ thành công", null));
    }

    /**
     * Làm thủ tục dọn vào (Move-in - UC-05).
     * Cho phép gán cư dân có sẵn (1-N) hoặc tạo mới tài khoản cư dân và chuyển trạng thái sang OCCUPIED.
     */
    @PostMapping("/apartments/{id}/move-in")
    public ResponseEntity<ApiResponse<ApartmentResponse>> moveIn(
            @PathVariable Long id,
            @RequestBody MoveInRequest request
    ) {
        ApartmentResponse result = apartmentService.moveIn(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Làm thủ tục dọn vào (Move-in) thành công", result));
    }

    /**
     * Làm thủ tục dọn đi (Move-out - UC-06).
     * Quy tắc BR-04: Bắt buộc hoàn thành mọi hóa đơn chưa thanh toán trước khi dọn đi.
     * Nếu cư dân không còn đứng tên căn hộ nào khác, tự động khóa tài khoản (is_active = 0).
     */
    @PostMapping("/apartments/{id}/move-out")
    public ResponseEntity<ApiResponse<ApartmentResponse>> moveOut(@PathVariable Long id) {
        ApartmentResponse result = apartmentService.moveOut(id);
        return ResponseEntity.ok(ApiResponse.ok("Làm thủ tục dọn đi (Move-out) thành công", result));
    }

    /**
     * Lấy danh sách phương tiện đã đăng ký gắn liền với căn hộ.
     */
    @GetMapping("/apartments/{id}/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehicles(@PathVariable Long id) {
        List<VehicleResponse> vehicles = apartmentService.getVehiclesByApartment(id);
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }

    /**
     * Đăng ký thêm phương tiện cho căn hộ (Xe máy / Ô tô để tính phí giữ xe hàng tháng).
     */
    @PostMapping("/apartments/{id}/vehicles")
    public ResponseEntity<ApiResponse<VehicleResponse>> addVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request
    ) {
        VehicleResponse response = apartmentService.addVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký phương tiện thành công", response));
    }

    /**
     * Xóa đăng ký phương tiện của căn hộ.
     */
    @DeleteMapping("/apartments/{id}/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable Long id,
            @PathVariable Long vehicleId
    ) {
        apartmentService.deleteVehicle(id, vehicleId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa phương tiện thành công", null));
    }

    /**
     * Lấy danh sách toàn bộ cư dân trong hệ thống (dùng cho form gán cư dân có sẵn).
     */
    @GetMapping("/users/residents")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getResidents() {
        List<UserResponse> list = apartmentService.getResidents();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Lấy danh sách toàn bộ kỹ thuật viên trong hệ thống (dùng cho form điều phối sự cố).
     */
    @GetMapping("/users/technicians")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getTechnicians() {
        List<UserResponse> list = apartmentService.getTechnicians();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
