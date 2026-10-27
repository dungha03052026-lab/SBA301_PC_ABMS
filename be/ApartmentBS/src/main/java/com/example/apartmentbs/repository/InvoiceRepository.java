package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Invoice;
import com.example.apartmentbs.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long>, JpaSpecificationExecutor<Invoice> {
    Optional<Invoice> findByInvoiceCode(String invoiceCode);
    List<Invoice> findByApartmentId(Long apartmentId);
    List<Invoice> findByApartmentIdOrderByBillingMonthDesc(Long apartmentId);
    List<Invoice> findByApartmentIdAndStatusIn(Long apartmentId, Collection<InvoiceStatus> statuses);
    long countByApartmentIdAndStatusIn(Long apartmentId, Collection<InvoiceStatus> statuses);
    List<Invoice> findByBillingMonth(String billingMonth);
    Optional<Invoice> findByApartmentIdAndBillingMonth(Long apartmentId, String billingMonth);
    List<Invoice> findByStatus(InvoiceStatus status);
    List<Invoice> findAllByOrderByCreatedAtDesc();
}
