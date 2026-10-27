package com.example.apartmentbs.service.impl;

import com.example.apartmentbs.dto.request.ApartmentRequest;
import com.example.apartmentbs.dto.request.MoveInRequest;
import com.example.apartmentbs.dto.request.VehicleRequest;
import com.example.apartmentbs.dto.response.ApartmentResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.dto.response.VehicleResponse;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.*;
import com.example.apartmentbs.repository.ApartmentRepository;
import com.example.apartmentbs.repository.InvoiceRepository;
import com.example.apartmentbs.repository.UserRepository;
import com.example.apartmentbs.repository.VehicleRepository;
import com.example.apartmentbs.repository.specification.ApartmentSpecification;
import com.example.apartmentbs.service.ApartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApartmentServiceImpl implements ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<ApartmentResponse> searchApartments(
            String buildingBlock,
            Integer floor,
            ApartmentStatus status,
            BigDecimal minArea,
            BigDecimal maxArea,
            String search
    ) {
        Specification<Apartment> spec = ApartmentSpecification.filter(
                buildingBlock, floor, status, minArea, maxArea, search
        );
        List<Apartment> apartments = apartmentRepository.findAll(spec, Sort.by(Sort.Direction.ASC, "roomNumber"));

        return apartments.stream()
                .map(apt -> {
                    List<Vehicle> vehicles = vehicleRepository.findByApartmentId(apt.getId());
                    return ApartmentResponse.fromEntity(apt, vehicles.size());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ApartmentResponse> searchApartmentsPaged(
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
    ) {
        Specification<Apartment> spec = ApartmentSpecification.filter(
                buildingBlock, floor, status, minArea, maxArea, search
        );

        String validSortBy = StringUtils.hasText(sortBy) ? sortBy : "roomNumber";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));

        Page<Apartment> apartmentPage = apartmentRepository.findAll(spec, pageable);

        List<ApartmentResponse> dtoList = apartmentPage.getContent().stream()
                .map(apt -> {
                    List<Vehicle> vehicles = vehicleRepository.findByApartmentId(apt.getId());
                    return ApartmentResponse.fromEntity(apt, vehicles.size());
                })
                .collect(Collectors.toList());

        return PageResponse.from(apartmentPage, dtoList);
    }

    @Override
    @Transactional(readOnly = true)
    public ApartmentResponse getApartmentById(Long id) {
        Apartment apt = findApartmentOrThrow(id);
        List<Vehicle> vehicles = vehicleRepository.findByApartmentId(apt.getId());
        return ApartmentResponse.fromEntity(apt, vehicles.size());
    }

    @Override
    @Transactional
    public ApartmentResponse createApartment(ApartmentRequest request) {
        if (apartmentRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new AppException("Mã căn hộ '" + request.getRoomNumber() + "' đã tồn tại trên hệ thống!");
        }

        Apartment apt = Apartment.builder()
                .roomNumber(request.getRoomNumber().trim())
                .floor(request.getFloor())
                .buildingBlock(request.getBuildingBlock().trim())
                .areaSqm(request.getAreaSqm())
                .status(ApartmentStatus.VACANT)
                .resident(null)
                .build();

        Apartment saved = apartmentRepository.save(apt);
        return ApartmentResponse.fromEntity(saved, 0);
    }

    @Override
    @Transactional
    public ApartmentResponse updateApartment(Long id, ApartmentRequest request) {
        Apartment apt = findApartmentOrThrow(id);

        if (!apt.getRoomNumber().equalsIgnoreCase(request.getRoomNumber().trim()) &&
                apartmentRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new AppException("Mã căn hộ '" + request.getRoomNumber() + "' đã tồn tại!");
        }

        apt.setRoomNumber(request.getRoomNumber().trim());
        apt.setFloor(request.getFloor());
        apt.setBuildingBlock(request.getBuildingBlock().trim());
        apt.setAreaSqm(request.getAreaSqm());

        Apartment updated = apartmentRepository.save(apt);
        List<Vehicle> vehicles = vehicleRepository.findByApartmentId(id);
        return ApartmentResponse.fromEntity(updated, vehicles.size());
    }

    @Override
    @Transactional
    public void deleteApartment(Long id) {
        Apartment apt = findApartmentOrThrow(id);
        if (apt.getStatus() == ApartmentStatus.OCCUPIED) {
            throw new AppException("Không thể xóa căn hộ đang có người ở (OCCUPIED). Vui lòng làm thủ tục dọn đi trước!");
        }
        apartmentRepository.delete(apt);
    }

    @Override
    @Transactional
    public ApartmentResponse moveIn(Long id, MoveInRequest request) {
        Apartment apt = findApartmentOrThrow(id);

        if (apt.getStatus() == ApartmentStatus.OCCUPIED) {
            throw new AppException("Căn hộ " + apt.getRoomNumber() + " hiện đang có người ở! Không thể thêm cư dân mới.");
        }

        User resident;
        if (request.getResidentId() != null) {
            // Cư dân đã có trên hệ thống (Hỗ trợ 1 cư dân sở hữu nhiều căn BR-02)
            resident = userRepository.findById(request.getResidentId())
                    .orElseThrow(() -> new AppException("Không tìm thấy cư dân có ID: " + request.getResidentId()));
            if (resident.getRole() != Role.RESIDENT) {
                throw new AppException("Người dùng được chọn không phải là Cư dân (RESIDENT)!");
            }
        } else {
            // Tạo mới cư dân
            if (!StringUtils.hasText(request.getFullName()) || !StringUtils.hasText(request.getPhoneNumber())) {
                throw new AppException("Vui lòng nhập họ tên và số điện thoại của cư dân mới!");
            }
            if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
                throw new AppException("Số điện thoại '" + request.getPhoneNumber() + "' đã được đăng ký bởi người dùng khác!");
            }

            String email = StringUtils.hasText(request.getEmail())
                    ? request.getEmail().trim()
                    : request.getPhoneNumber().trim() + "@building.vn";

            resident = User.builder()
                    .fullName(request.getFullName().trim())
                    .phoneNumber(request.getPhoneNumber().trim())
                    .email(email)
                    .passwordHash(passwordEncoder.encode("123456"))
                    .role(Role.RESIDENT)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();

            resident = userRepository.save(resident);
        }

        apt.setResident(resident);
        apt.setStatus(ApartmentStatus.OCCUPIED);
        Apartment saved = apartmentRepository.save(apt);

        return ApartmentResponse.fromEntity(saved, 0);
    }

    @Override
    @Transactional
    public ApartmentResponse moveOut(Long id) {
        Apartment apt = findApartmentOrThrow(id);

        if (apt.getStatus() == ApartmentStatus.VACANT) {
            throw new AppException("Căn hộ " + apt.getRoomNumber() + " hiện đang trống, không thể thực hiện dọn đi!");
        }

        // BR-04: RÀNG BUỘC CHẶN DỌN ĐI NẾU CÒN NỢ HÓA ĐƠN
        long unpaidCount = invoiceRepository.countByApartmentIdAndStatusIn(
                id, List.of(InvoiceStatus.UNPAID, InvoiceStatus.PENDING)
        );
        if (unpaidCount > 0) {
            throw new AppException(
                    "KHÔNG THỂ THỰC HIỆN DỌN ĐI (Move-out): Căn hộ " + apt.getRoomNumber() +
                    " hiện còn " + unpaidCount + " hóa đơn chưa thanh toán hoặc đang chờ duyệt (BR-04). " +
                    "Bắt buộc thanh toán toàn bộ công nợ trước khi rời đi!",
                    HttpStatus.CONFLICT
            );
        }

        // Xóa các phương tiện liên quan đến căn hộ
        vehicleRepository.deleteByApartmentId(id);

        // Chuyển trạng thái căn hộ về trống
        apt.setResident(null);
        apt.setStatus(ApartmentStatus.VACANT);
        Apartment saved = apartmentRepository.save(apt);

        return ApartmentResponse.fromEntity(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByApartment(Long apartmentId) {
        findApartmentOrThrow(apartmentId);
        return vehicleRepository.findByApartmentId(apartmentId).stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VehicleResponse addVehicle(Long apartmentId, VehicleRequest request) {
        Apartment apt = findApartmentOrThrow(apartmentId);
        if (apt.getStatus() == ApartmentStatus.VACANT) {
            throw new AppException("Không thể đăng ký phương tiện cho căn hộ đang trống!");
        }

        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate().trim())) {
            throw new AppException("Biển số xe '" + request.getLicensePlate() + "' đã được đăng ký trong hệ thống!");
        }

        String ownerName = StringUtils.hasText(request.getOwnerName())
                ? request.getOwnerName().trim()
                : (apt.getResident() != null ? apt.getResident().getFullName() : "");

        Vehicle vehicle = Vehicle.builder()
                .apartment(apt)
                .licensePlate(request.getLicensePlate().trim().toUpperCase())
                .vehicleType(request.getVehicleType())
                .ownerName(ownerName)
                .createdAt(LocalDateTime.now())
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long apartmentId, Long vehicleId) {
        findApartmentOrThrow(apartmentId);
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new AppException("Không tìm thấy phương tiện có ID: " + vehicleId));

        if (!vehicle.getApartment().getId().equals(apartmentId)) {
            throw new AppException("Phương tiện không thuộc căn hộ này!");
        }

        vehicleRepository.delete(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApartmentResponse> getApartmentsByResident(Long residentId) {
        return apartmentRepository.findByResidentId(residentId).stream()
                .map(apt -> {
                    List<Vehicle> vehicles = vehicleRepository.findByApartmentId(apt.getId());
                    return ApartmentResponse.fromEntity(apt, vehicles.size());
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getResidents() {
        return userRepository.findByRole(Role.RESIDENT).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private Apartment findApartmentOrThrow(Long id) {
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy căn hộ có ID: " + id, HttpStatus.NOT_FOUND));
    }
}
