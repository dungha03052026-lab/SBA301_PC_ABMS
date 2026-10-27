package com.example.apartmentbs.dto.response;

import com.example.apartmentbs.model.Ticket;
import com.example.apartmentbs.model.TicketCategory;
import com.example.apartmentbs.model.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long id;
    private String ticketCode;
    private Long apartmentId;
    private String roomNumber;
    private Integer floor;
    private String buildingBlock;

    private Long residentId;
    private String residentName;
    private String residentPhone;

    private TicketCategory category;
    private String title;
    private String description;
    private String imageUrl;
    private TicketStatus status;

    private Long assignedToId;
    private String assignedToName;
    private String technicianNote;
    private Integer rating;

    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    private boolean isOverdue;

    public static TicketResponse fromEntity(Ticket ticket) {
        if (ticket == null) return null;

        boolean overdue = false;
        if (ticket.getStatus() == TicketStatus.OPEN && ticket.getCreatedAt() != null) {
            long hours = Duration.between(ticket.getCreatedAt(), LocalDateTime.now()).toHours();
            if (hours >= 24) {
                overdue = true;
            }
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .apartmentId(ticket.getApartment() != null ? ticket.getApartment().getId() : null)
                .roomNumber(ticket.getApartment() != null ? ticket.getApartment().getRoomNumber() : "")
                .floor(ticket.getApartment() != null ? ticket.getApartment().getFloor() : null)
                .buildingBlock(ticket.getApartment() != null ? ticket.getApartment().getBuildingBlock() : "")
                .residentId(ticket.getResident() != null ? ticket.getResident().getId() : null)
                .residentName(ticket.getResident() != null ? ticket.getResident().getFullName() : "")
                .residentPhone(ticket.getResident() != null ? ticket.getResident().getPhoneNumber() : "")
                .category(ticket.getCategory())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .imageUrl(ticket.getImageUrl())
                .status(ticket.getStatus())
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : null)
                .technicianNote(ticket.getTechnicianNote())
                .rating(ticket.getRating())
                .createdAt(ticket.getCreatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .isOverdue(overdue)
                .build();
    }
}
