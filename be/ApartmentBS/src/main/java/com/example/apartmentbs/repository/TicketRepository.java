package com.example.apartmentbs.repository;

import com.example.apartmentbs.model.Ticket;
import com.example.apartmentbs.model.TicketStatus;
import com.example.apartmentbs.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {
    Optional<Ticket> findByTicketCode(String ticketCode);
    List<Ticket> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);
    List<Ticket> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    List<Ticket> findByAssignedToIdOrderByCreatedAtDesc(Long technicianId);
    List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);
    List<Ticket> findAllByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Ticket t SET t.status = com.example.apartmentbs.model.TicketStatus.IN_PROGRESS, t.assignedTo = :technician WHERE t.id = :ticketId AND t.status = com.example.apartmentbs.model.TicketStatus.OPEN")
    int claimTicket(@Param("ticketId") Long ticketId, @Param("technician") User technician);
}
