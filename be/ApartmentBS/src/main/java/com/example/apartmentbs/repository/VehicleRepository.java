package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Vehicle;
import com.example.apartmentbs.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByApartmentId(Long apartmentId);
    boolean existsByLicensePlate(String licensePlate);
    long countByApartmentIdAndVehicleType(Long apartmentId, VehicleType vehicleType);
    void deleteByApartmentId(Long apartmentId);
}
