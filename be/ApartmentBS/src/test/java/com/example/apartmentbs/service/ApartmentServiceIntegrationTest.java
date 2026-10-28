package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.ApartmentRequest;
import com.example.apartmentbs.dto.request.MoveInRequest;
import com.example.apartmentbs.dto.response.ApartmentResponse;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.*;
import com.example.apartmentbs.repository.ApartmentRepository;
import com.example.apartmentbs.repository.InvoiceRepository;
import com.example.apartmentbs.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ApartmentServiceIntegrationTest {

    @Autowired
    private ApartmentService apartmentService;

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    @DisplayName("TDD Service 1: Thêm mới căn hộ lưu thành công vào CSDL thực tế")
    void testCreateApartment_Success() {
        ApartmentRequest request = ApartmentRequest.builder()
                .roomNumber("INTEG-101")
                .floor(1)
                .buildingBlock("A")
                .areaSqm(new BigDecimal("75.50"))
                .build();

        ApartmentResponse response = apartmentService.createApartment(request);

        assertNotNull(response.getId());
        assertEquals("INTEG-101", response.getRoomNumber());
        assertEquals(ApartmentStatus.VACANT, response.getStatus());

        // Kiểm tra trực tiếp trong Repository/Database
        Apartment inDb = apartmentRepository.findById(response.getId()).orElse(null);
        assertNotNull(inDb);
        assertEquals("INTEG-101", inDb.getRoomNumber());
        assertEquals(new BigDecimal("75.50"), inDb.getAreaSqm());
    }

    @Test
    @DisplayName("TDD Service 2: Trùng mã căn hộ phải ném ngoại lệ AppException")
    void testCreateApartment_DuplicateRoomNumber_ThrowsAppException() {
        ApartmentRequest req1 = ApartmentRequest.builder()
                .roomNumber("INTEG-DUP")
                .floor(1)
                .buildingBlock("A")
                .areaSqm(new BigDecimal("60.00"))
                .build();
        apartmentService.createApartment(req1);

        ApartmentRequest req2 = ApartmentRequest.builder()
                .roomNumber("INTEG-DUP")
                .floor(2)
                .buildingBlock("B")
                .areaSqm(new BigDecimal("80.00"))
                .build();

        AppException ex = assertThrows(AppException.class, () -> apartmentService.createApartment(req2));
        assertTrue(ex.getMessage().contains("đã tồn tại"));
    }

    @Test
    @DisplayName("TDD Service 3: Tiếp nhận cư dân mới (Move-in) lưu User và đổi trạng thái căn hộ thành OCCUPIED")
    void testMoveIn_NewResident_PersistsUserAndApartment() {
        ApartmentRequest aptReq = ApartmentRequest.builder()
                .roomNumber("INTEG-MOVEIN")
                .floor(2)
                .buildingBlock("A")
                .areaSqm(new BigDecimal("70.00"))
                .build();
        ApartmentResponse created = apartmentService.createApartment(aptReq);

        MoveInRequest moveInReq = MoveInRequest.builder()
                .fullName("Nguyễn Cư Dân Mới")
                .phoneNumber("0977112233")
                .email("cudanmoi@example.com")
                .build();

        ApartmentResponse moveInRes = apartmentService.moveIn(created.getId(), moveInReq);

        assertEquals(ApartmentStatus.OCCUPIED, moveInRes.getStatus());
        assertNotNull(moveInRes.getResident());
        assertEquals("Nguyễn Cư Dân Mới", moveInRes.getResident().getFullName());

        // Kiểm tra cư dân được tạo trong DB
        User userInDb = userRepository.findByPhoneNumber("0977112233").orElse(null);
        assertNotNull(userInDb);
        assertEquals(Role.RESIDENT, userInDb.getRole());
    }

    @Test
    @DisplayName("TDD Service 4: Ràng buộc BR-04 chặn dọn đi (Move-out) khi còn nợ hóa đơn UNPAID")
    void testMoveOut_WithUnpaidInvoices_ThrowsAppException() {
        ApartmentRequest aptReq = ApartmentRequest.builder()
                .roomNumber("INTEG-DEBT")
                .floor(3)
                .buildingBlock("B")
                .areaSqm(new BigDecimal("90.00"))
                .build();
        ApartmentResponse apt = apartmentService.createApartment(aptReq);

        MoveInRequest moveInReq = MoveInRequest.builder()
                .fullName("Cư Dân Nợ Tiền")
                .phoneNumber("0966998877")
                .email("debtor@example.com")
                .build();
        apartmentService.moveIn(apt.getId(), moveInReq);

        // Tạo hóa đơn UNPAID cho căn hộ này
        Apartment aptEntity = apartmentRepository.findById(apt.getId()).orElseThrow();
        Invoice invoice = Invoice.builder()
                .invoiceCode("INV-TEST-001")
                .apartment(aptEntity)
                .billingMonth("2026-10")
                .oldElectricNum(100)
                .newElectricNum(150)
                .oldWaterNum(50)
                .newWaterNum(60)
                .totalAmount(new BigDecimal("1000000"))
                .status(InvoiceStatus.UNPAID)
                .dueDate(java.time.LocalDate.now().plusDays(10))
                .createdAt(LocalDateTime.now())
                .build();
        invoiceRepository.save(invoice);

        // Cố gắng Move-out khi đang nợ tiền
        AppException ex = assertThrows(AppException.class, () -> apartmentService.moveOut(apt.getId()));
        assertTrue(ex.getMessage().contains("chưa thanh toán"));
    }

    @Test
    @DisplayName("TDD Service 5: Dọn đi (Move-out) thành công khi không còn nợ hóa đơn, căn hộ về VACANT")
    void testMoveOut_CleanDebt_SuccessfullyVacates() {
        ApartmentRequest aptReq = ApartmentRequest.builder()
                .roomNumber("INTEG-CLEAN")
                .floor(4)
                .buildingBlock("B")
                .areaSqm(new BigDecimal("90.00"))
                .build();
        ApartmentResponse apt = apartmentService.createApartment(aptReq);

        MoveInRequest moveInReq = MoveInRequest.builder()
                .fullName("Cư Dân Chuẩn Mực")
                .phoneNumber("0955443322")
                .email("clean@example.com")
                .build();
        apartmentService.moveIn(apt.getId(), moveInReq);

        // Không có hóa đơn nợ -> Move-out thành công
        ApartmentResponse moveOutRes = apartmentService.moveOut(apt.getId());

        assertEquals(ApartmentStatus.VACANT, moveOutRes.getStatus());
        assertNull(moveOutRes.getResident());

        // Kiểm tra CSDL
        Apartment inDb = apartmentRepository.findById(apt.getId()).orElseThrow();
        assertEquals(ApartmentStatus.VACANT, inDb.getStatus());
        assertNull(inDb.getResident());
    }
}
