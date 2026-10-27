package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.ServiceTariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceTariffRepository extends JpaRepository<ServiceTariff, Integer> {
}
