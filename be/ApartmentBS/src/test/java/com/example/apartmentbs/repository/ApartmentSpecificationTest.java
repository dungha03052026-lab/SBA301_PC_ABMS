package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Apartment;
import com.example.apartmentbs.model.ApartmentStatus;
import com.example.apartmentbs.model.Role;
import com.example.apartmentbs.model.User;
import com.example.apartmentbs.repository.specification.ApartmentSpecification;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ApartmentSpecificationTest {

    @Autowired
    private ApartmentRepository apartmentRepository;

    @Autowired
    private UserRepository userRepository;

    private Apartment testApt1;
    private Apartment testApt2;
    private Apartment testApt3;
    private User residentUser;

    @BeforeEach
    void setUp() {
        residentUser = User.builder()
                .fullName("Lê Văn Kiểm Thử")
                .phoneNumber("0988776655")
                .email("test.kiemthu@example.com")
                .passwordHash("hashed")
                .role(Role.RESIDENT)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();
        residentUser = userRepository.save(residentUser);

        testApt1 = Apartment.builder()
                .roomNumber("TEST-A101")
                .buildingBlock("A")
                .floor(1)
                .areaSqm(new BigDecimal("65.50"))
                .status(ApartmentStatus.OCCUPIED)
                .resident(residentUser)
                .build();
        apartmentRepository.save(testApt1);

        testApt2 = Apartment.builder()
                .roomNumber("TEST-A202")
                .buildingBlock("A")
                .floor(2)
                .areaSqm(new BigDecimal("85.00"))
                .status(ApartmentStatus.VACANT)
                .resident(null)
                .build();
        apartmentRepository.save(testApt2);

        testApt3 = Apartment.builder()
                .roomNumber("TEST-B303")
                .buildingBlock("B")
                .floor(3)
                .areaSqm(new BigDecimal("110.00"))
                .status(ApartmentStatus.VACANT)
                .resident(null)
                .build();
        apartmentRepository.save(testApt3);
    }

    @Test
    @DisplayName("TDD 1: Lọc căn hộ theo khối nhà (hasBuildingBlock)")
    void testFilterByBuildingBlock() {
        Specification<Apartment> spec = ApartmentSpecification.hasBuildingBlock("A");
        List<Apartment> results = apartmentRepository.findAll(spec);

        assertTrue(results.stream().anyMatch(a -> "TEST-A101".equals(a.getRoomNumber())));
        assertTrue(results.stream().anyMatch(a -> "TEST-A202".equals(a.getRoomNumber())));
        assertFalse(results.stream().anyMatch(a -> "TEST-B303".equals(a.getRoomNumber())));
    }

    @Test
    @DisplayName("TDD 2: Lọc căn hộ theo trạng thái (hasStatus)")
    void testFilterByStatus() {
        Specification<Apartment> specVacant = ApartmentSpecification.hasStatus(ApartmentStatus.VACANT);
        List<Apartment> vacantResults = apartmentRepository.findAll(specVacant);

        assertTrue(vacantResults.stream().anyMatch(a -> "TEST-A202".equals(a.getRoomNumber())));
        assertTrue(vacantResults.stream().anyMatch(a -> "TEST-B303".equals(a.getRoomNumber())));
        assertFalse(vacantResults.stream().anyMatch(a -> "TEST-A101".equals(a.getRoomNumber())));
    }

    @Test
    @DisplayName("TDD 3: Lọc căn hộ theo khoảng diện tích (areaBetween)")
    void testFilterByAreaBetween() {
        Specification<Apartment> spec = ApartmentSpecification.areaBetween(new BigDecimal("60"), new BigDecimal("90"));
        List<Apartment> results = apartmentRepository.findAll(spec);

        assertTrue(results.stream().anyMatch(a -> "TEST-A101".equals(a.getRoomNumber())));
        assertTrue(results.stream().anyMatch(a -> "TEST-A202".equals(a.getRoomNumber())));
        assertFalse(results.stream().anyMatch(a -> "TEST-B303".equals(a.getRoomNumber())));
    }

    @Test
    @DisplayName("TDD 4: Tìm kiếm đa trường - Khớp tên cư dân hoặc SĐT qua LEFT JOIN (searchGeneral)")
    void testSearchGeneralByResidentNameAndPhone() {
        // Tìm theo tên cư dân
        Specification<Apartment> specName = ApartmentSpecification.searchGeneral("Kiểm Thử");
        List<Apartment> resultsName = apartmentRepository.findAll(specName);
        assertEquals(1, resultsName.stream().filter(a -> a.getRoomNumber().startsWith("TEST-")).count());
        assertEquals("TEST-A101", resultsName.stream().filter(a -> a.getRoomNumber().startsWith("TEST-")).findFirst().get().getRoomNumber());

        // Tìm theo số điện thoại
        Specification<Apartment> specPhone = ApartmentSpecification.searchGeneral("0988776655");
        List<Apartment> resultsPhone = apartmentRepository.findAll(specPhone);
        assertTrue(resultsPhone.stream().anyMatch(a -> "TEST-A101".equals(a.getRoomNumber())));

        // Tìm theo mã phòng
        Specification<Apartment> specRoom = ApartmentSpecification.searchGeneral("B303");
        List<Apartment> resultsRoom = apartmentRepository.findAll(specRoom);
        assertTrue(resultsRoom.stream().anyMatch(a -> "TEST-B303".equals(a.getRoomNumber())));
    }

    @Test
    @DisplayName("TDD 5: Ghép nối đa điều kiện với ApartmentSpecification.filter()")
    void testCompositeFilter() {
        Specification<Apartment> spec = ApartmentSpecification.filter(
                "A",
                null,
                ApartmentStatus.OCCUPIED,
                new BigDecimal("50"),
                new BigDecimal("100"),
                "TEST-A1"
        );
        List<Apartment> results = apartmentRepository.findAll(spec);

        assertEquals(1, results.stream().filter(a -> a.getRoomNumber().startsWith("TEST-")).count());
        assertEquals("TEST-A101", results.stream().filter(a -> a.getRoomNumber().startsWith("TEST-")).findFirst().get().getRoomNumber());
    }
}
