package com.example.apartmentbs.repository.specification;

import com.example.apartmentbs.model.Apartment;
import com.example.apartmentbs.model.ApartmentStatus;
import com.example.apartmentbs.model.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * Specification Pattern - Best Practice của Spring Data JPA:
 * Chia nhỏ từng điều kiện lọc thành các hàm độc lập và ghép nối bằng Fluent API Specification.where().and()
 */
public class ApartmentSpecification {

    // =========================================================================
    // 1. COMPOSER: Ghép nối tất cả các điều kiện theo nhu cầu người dùng
    // =========================================================================
    public static Specification<Apartment> filter(
            String buildingBlock,
            Integer floor,
            ApartmentStatus status,
            BigDecimal minArea,
            BigDecimal maxArea,
            String search
    ) {
        return Specification
                .where(hasBuildingBlock(buildingBlock))
                .and(hasFloor(floor))
                .and(hasStatus(status))
                .and(areaBetween(minArea, maxArea))
                .and(searchGeneral(search));
    }

    // =========================================================================
    // 2. ATOMIC SPECIFICATIONS: Mỗi hàm chỉ làm DUY NHẤT 1 việc (Single Responsibility)
    // =========================================================================

    // Lọc theo khối nhà (Tòa A, Tòa B)
    public static Specification<Apartment> hasBuildingBlock(String buildingBlock) {
        return (root, query, cb) ->
                StringUtils.hasText(buildingBlock) ? cb.equal(root.get("buildingBlock"), buildingBlock) : null;
    }

    // Lọc theo tầng lầu
    public static Specification<Apartment> hasFloor(Integer floor) {
        return (root, query, cb) ->
                floor != null ? cb.equal(root.get("floor"), floor) : null;
    }

    // Lọc theo trạng thái phòng (VACANT, OCCUPIED)
    public static Specification<Apartment> hasStatus(ApartmentStatus status) {
        return (root, query, cb) ->
                status != null ? cb.equal(root.get("status"), status) : null;
    }

    // Lọc theo khoảng diện tích
    public static Specification<Apartment> areaBetween(BigDecimal minArea, BigDecimal maxArea) {
        return (root, query, cb) -> {
            if (minArea != null && maxArea != null) {
                return cb.between(root.get("areaSqm"), minArea, maxArea);
            }
            if (minArea != null) {
                return cb.greaterThanOrEqualTo(root.get("areaSqm"), minArea);
            }
            if (maxArea != null) {
                return cb.lessThanOrEqualTo(root.get("areaSqm"), maxArea);
            }
            return null;
        };
    }

    // Tìm kiếm đa trường: Mã phòng HOẶC Tên cư dân HOẶC Số điện thoại (LEFT JOIN User)
    public static Specification<Apartment> searchGeneral(String search) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(search)) {
                return null;
            }
            String pattern = "%" + search.trim().toLowerCase() + "%";
            Join<Apartment, User> residentJoin = root.join("resident", JoinType.LEFT);

            return cb.or(
                    cb.like(cb.lower(root.get("roomNumber")), pattern),
                    cb.like(cb.lower(residentJoin.get("fullName")), pattern),
                    cb.like(cb.lower(residentJoin.get("phoneNumber")), pattern)
            );
        };
    }
}
