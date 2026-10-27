package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.ApartmentRequest;
import com.example.apartmentbs.dto.request.MoveInRequest;
import com.example.apartmentbs.dto.request.VehicleRequest;
import com.example.apartmentbs.dto.response.ApartmentResponse;
import com.example.apartmentbs.dto.response.UserResponse;
import com.example.apartmentbs.dto.response.VehicleResponse;
import com.example.apartmentbs.model.ApartmentStatus;

import java.math.BigDecimal;
import java.util.List;

public interface ApartmentService {
    List<ApartmentResponse> searchApartments(
            String buildingBlock,
            Integer floor,
            ApartmentStatus status,
            BigDecimal minArea,
            BigDecimal maxArea,
            String search
    );

    com.example.apartmentbs.dto.response.PageResponse<ApartmentResponse> searchApartmentsPaged(
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

    ApartmentResponse getApartmentById(Long id);
    ApartmentResponse createApartment(ApartmentRequest request);
    ApartmentResponse updateApartment(Long id, ApartmentRequest request);
    void deleteApartment(Long id);

    ApartmentResponse moveIn(Long id, MoveInRequest request);
    ApartmentResponse moveOut(Long id);

    List<VehicleResponse> getVehiclesByApartment(Long apartmentId);
    VehicleResponse addVehicle(Long apartmentId, VehicleRequest request);
    void deleteVehicle(Long apartmentId, Long vehicleId);

    List<ApartmentResponse> getApartmentsByResident(Long residentId);
    List<UserResponse> getResidents();
    List<UserResponse> getTechnicians();
}
