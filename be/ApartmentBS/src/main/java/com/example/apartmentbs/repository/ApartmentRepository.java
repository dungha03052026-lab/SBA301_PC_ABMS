package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Apartment;
import com.example.apartmentbs.model.ApartmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long>, JpaSpecificationExecutor<Apartment> {
    Optional<Apartment> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    List<Apartment> findByResidentId(Long residentId);
    List<Apartment> findByStatus(ApartmentStatus status);
}
