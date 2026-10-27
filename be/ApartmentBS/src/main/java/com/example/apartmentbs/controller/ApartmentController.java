package com.example.apartmentbs.controller;

import com.example.apartmentbs.dto.request.ApartmentRequest;
import com.example.apartmentbs.dto.request.MoveInRequest;
import com.example.apartmentbs.dto.request.VehicleRequest;
import com.example.apartmentbs.dto.response.ApiResponse;
import com.example.apartmentbs.dto.response.ApartmentResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.dto.response.VehicleResponse;
import com.example.apartmentbs.model.ApartmentStatus;
import com.example.apartmentbs.service.ApartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ApartmentController {

    private final ApartmentService apartmentService;

    @GetMapping("/apartments")
    public ResponseEntity<ApiResponse<List<ApartmentResponse>>> searchApartments(
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

    @GetMapping("/apartments/{id}")
    public ResponseEntity<ApiResponse<ApartmentResponse>> getApartmentById(@PathVariable Long id) {
        ApartmentResponse result = apartmentService.getApartmentById(id);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/apartments")
    public ResponseEntity<ApiResponse<ApartmentResponse>> createApartment(
            @Valid @RequestBody ApartmentRequest request
    ) {
        ApartmentResponse result = apartmentService.createApartment(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo căn hộ thành công", result));
    }

    @PutMapping("/apartments/{id}")
    public ResponseEntity<ApiResponse<ApartmentResponse>> updateApartment(
            @PathVariable Long id,
            @Valid @RequestBody ApartmentRequest request
    ) {
        ApartmentResponse result = apartmentService.updateApartment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin căn hộ thành công", result));
    }

    @DeleteMapping("/apartments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa căn hộ thành công", null));
    }

    @PostMapping("/apartments/{id}/move-in")
    public ResponseEntity<ApiResponse<ApartmentResponse>> moveIn(
            @PathVariable Long id,
            @RequestBody MoveInRequest request
    ) {
        ApartmentResponse result = apartmentService.moveIn(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Làm thủ tục dọn vào (Move-in) thành công", result));
    }

    @PostMapping("/apartments/{id}/move-out")
    public ResponseEntity<ApiResponse<ApartmentResponse>> moveOut(@PathVariable Long id) {
        ApartmentResponse result = apartmentService.moveOut(id);
        return ResponseEntity.ok(ApiResponse.ok("Làm thủ tục dọn đi (Move-out) thành công", result));
    }

    @GetMapping("/apartments/{id}/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehicles(@PathVariable Long id) {
        List<VehicleResponse> vehicles = apartmentService.getVehiclesByApartment(id);
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }

    @PostMapping("/apartments/{id}/vehicles")
    public ResponseEntity<ApiResponse<VehicleResponse>> addVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request
    ) {
        VehicleResponse response = apartmentService.addVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng ký phương tiện thành công", response));
    }

    @DeleteMapping("/apartments/{id}/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(
            @PathVariable Long id,
            @PathVariable Long vehicleId
    ) {
        apartmentService.deleteVehicle(id, vehicleId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa phương tiện thành công", null));
    }

    @GetMapping("/users/residents")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getResidents() {
        List<UserResponse> list = apartmentService.getResidents();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/users/technicians")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getTechnicians() {
        List<UserResponse> list = apartmentService.getTechnicians();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
