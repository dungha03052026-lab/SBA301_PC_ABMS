package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.ServiceTariff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository lưu trữ và truy vấn Biểu phí dịch vụ tòa nhà (ServiceTariff).
 * Mặc định lưu bản ghi duy nhất với ID = 1.
 */
@Repository
public interface ServiceTariffRepository extends JpaRepository<ServiceTariff, Integer> {
}
