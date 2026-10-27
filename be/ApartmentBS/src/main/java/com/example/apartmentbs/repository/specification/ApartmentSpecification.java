package com.example.apartmentbs.repository.specification;

import com.example.apartmentbs.model.Apartment;
import com.example.apartmentbs.model.ApartmentStatus;
import com.example.apartmentbs.model.User;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ApartmentSpecification {

    public static Specification<Apartment> filter(
            String buildingBlock,
            Integer floor,
            ApartmentStatus status,
            BigDecimal minArea,
            BigDecimal maxArea,
            String search
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(buildingBlock)) {
                predicates.add(cb.equal(root.get("buildingBlock"), buildingBlock));
            }

            if (floor != null) {
                predicates.add(cb.equal(root.get("floor"), floor));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (minArea != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("areaSqm"), minArea));
            }

            if (maxArea != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("areaSqm"), maxArea));
            }

            if (StringUtils.hasText(search)) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate roomMatch = cb.like(cb.lower(root.get("roomNumber")), pattern);

                Join<Apartment, User> residentJoin = root.join("resident", JoinType.LEFT);
                Predicate residentNameMatch = cb.like(cb.lower(residentJoin.get("fullName")), pattern);
                Predicate residentPhoneMatch = cb.like(cb.lower(residentJoin.get("phoneNumber")), pattern);

                predicates.add(cb.or(roomMatch, residentNameMatch, residentPhoneMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
