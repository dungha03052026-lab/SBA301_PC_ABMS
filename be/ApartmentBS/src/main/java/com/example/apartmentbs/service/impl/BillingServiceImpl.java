package com.example.apartmentbs.service.impl;

import com.example.apartmentbs.dto.request.BatchInvoiceCreateRequest;
import com.example.apartmentbs.dto.request.MeterReadingItem;
import com.example.apartmentbs.dto.request.TariffRequest;
import com.example.apartmentbs.dto.response.InvoiceBreakdown;
import com.example.apartmentbs.dto.response.InvoiceResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TariffResponse;
import com.example.apartmentbs.exception.AppException;
import com.example.apartmentbs.model.*;
import com.example.apartmentbs.repository.*;
import com.example.apartmentbs.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final ServiceTariffRepository tariffRepository;
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public TariffResponse getTariff() {
        ServiceTariff tariff = getOrInitTariff();
        return TariffResponse.fromEntity(tariff);
    }

    @Override
    @Transactional
    public TariffResponse updateTariff(TariffRequest request) {
        ServiceTariff tariff = getOrInitTariff();
        tariff.setManagementFeePerSqm(request.getManagementFeePerSqm());
        tariff.setElectricityUnitPrice(request.getElectricityUnitPrice());
        tariff.setWaterUnitPrice(request.getWaterUnitPrice());
        tariff.setMotorbikeFee(request.getMotorbikeFee());
        tariff.setCarFee(request.getCarFee());
        tariff.setUpdatedAt(LocalDateTime.now());

        ServiceTariff saved = tariffRepository.save(tariff);
        return TariffResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> searchInvoices(String billingMonth, InvoiceStatus status, Long apartmentId) {
        List<Invoice> invoices;
        if (apartmentId != null) {
            invoices = invoiceRepository.findByApartmentIdOrderByBillingMonthDesc(apartmentId);
        } else if (status != null) {
            invoices = invoiceRepository.findByStatus(status);
        } else if (billingMonth != null && !billingMonth.isBlank()) {
            invoices = invoiceRepository.findByBillingMonth(billingMonth);
        } else {
            invoices = invoiceRepository.findAllByOrderByCreatedAtDesc();
        }

        ServiceTariff tariff = getOrInitTariff();
        return invoices.stream()
                .map(inv -> enrichInvoiceResponse(inv, tariff))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceResponse> searchInvoicesPaged(
            String billingMonth,
            InvoiceStatus status,
            Long apartmentId,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        String validSortBy = StringUtils.hasText(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, validSortBy));

        Page<Invoice> invoicePage;
        if (apartmentId != null) {
            invoicePage = invoiceRepository.findByApartmentId(apartmentId, pageable);
        } else if (status != null) {
            invoicePage = invoiceRepository.findByStatus(status, pageable);
        } else if (StringUtils.hasText(billingMonth)) {
            invoicePage = invoiceRepository.findByBillingMonth(billingMonth, pageable);
        } else {
            invoicePage = invoiceRepository.findAll(pageable);
        }

        ServiceTariff tariff = getOrInitTariff();
        List<InvoiceResponse> content = invoicePage.getContent().stream()
                .map(inv -> enrichInvoiceResponse(inv, tariff))
                .collect(Collectors.toList());

        return PageResponse.from(invoicePage, content);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy hóa đơn có ID: " + id, HttpStatus.NOT_FOUND));
        return enrichInvoiceResponse(invoice, getOrInitTariff());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByApartment(Long apartmentId) {
        ServiceTariff tariff = getOrInitTariff();
        return invoiceRepository.findByApartmentIdOrderByBillingMonthDesc(apartmentId).stream()
                .map(inv -> enrichInvoiceResponse(inv, tariff))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<InvoiceResponse> batchGenerateInvoices(BatchInvoiceCreateRequest request) {
        ServiceTariff tariff = getOrInitTariff();
        List<InvoiceResponse> results = new ArrayList<>();

        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(15);

        for (MeterReadingItem item : request.getReadings()) {
            Apartment apt = apartmentRepository.findById(item.getApartmentId())
                    .orElseThrow(() -> new AppException("Không tìm thấy căn hộ ID: " + item.getApartmentId()));

            // Chỉ tạo hóa đơn cho căn hộ đang có người ở (OCCUPIED)
            if (apt.getStatus() != ApartmentStatus.OCCUPIED) {
                continue;
            }

            // Kiểm tra số mới >= số cũ
            if (item.getNewElectricNum() < item.getOldElectricNum()) {
                throw new AppException("Căn " + apt.getRoomNumber() + ": Số điện mới (" + item.getNewElectricNum() +
                        ") không được nhỏ hơn số cũ (" + item.getOldElectricNum() + ")!");
            }
            if (item.getNewWaterNum() < item.getOldWaterNum()) {
                throw new AppException("Căn " + apt.getRoomNumber() + ": Số nước mới (" + item.getNewWaterNum() +
                        ") không được nhỏ hơn số cũ (" + item.getOldWaterNum() + ")!");
            }

            // BR-05: TÍNH PHÍ THEO ĐƠN GIÁ CHUẨN
            int electricUsage = item.getNewElectricNum() - item.getOldElectricNum();
            int waterUsage = item.getNewWaterNum() - item.getOldWaterNum();

            BigDecimal mgmtFee = apt.getAreaSqm().multiply(tariff.getManagementFeePerSqm());
            BigDecimal elecAmount = BigDecimal.valueOf(electricUsage).multiply(tariff.getElectricityUnitPrice());
            BigDecimal waterAmount = BigDecimal.valueOf(waterUsage).multiply(tariff.getWaterUnitPrice());

            long motoCount = vehicleRepository.countByApartmentIdAndVehicleType(apt.getId(), VehicleType.MOTORBIKE);
            long carCount = vehicleRepository.countByApartmentIdAndVehicleType(apt.getId(), VehicleType.CAR);
            BigDecimal parkingFee = BigDecimal.valueOf(motoCount).multiply(tariff.getMotorbikeFee())
                    .add(BigDecimal.valueOf(carCount).multiply(tariff.getCarFee()));

            BigDecimal totalAmount = mgmtFee.add(elecAmount).add(waterAmount).add(parkingFee);

            String code = String.format("INV-%s-%s",
                    request.getBillingMonth().replace("-", ""),
                    apt.getRoomNumber().replace("-", ""));

            Optional<Invoice> existingOpt = invoiceRepository.findByApartmentIdAndBillingMonth(apt.getId(), request.getBillingMonth());
            Invoice invoice;
            if (existingOpt.isPresent()) {
                invoice = existingOpt.get();
                invoice.setOldElectricNum(item.getOldElectricNum());
                invoice.setNewElectricNum(item.getNewElectricNum());
                invoice.setOldWaterNum(item.getOldWaterNum());
                invoice.setNewWaterNum(item.getNewWaterNum());
                invoice.setTotalAmount(totalAmount);
                invoice.setDueDate(dueDate);
            } else {
                invoice = Invoice.builder()
                        .invoiceCode(code)
                        .apartment(apt)
                        .billingMonth(request.getBillingMonth())
                        .oldElectricNum(item.getOldElectricNum())
                        .newElectricNum(item.getNewElectricNum())
                        .oldWaterNum(item.getOldWaterNum())
                        .newWaterNum(item.getNewWaterNum())
                        .totalAmount(totalAmount)
                        .status(InvoiceStatus.UNPAID)
                        .dueDate(dueDate)
                        .createdAt(LocalDateTime.now())
                        .build();
            }

            Invoice saved = invoiceRepository.save(invoice);
            results.add(enrichInvoiceResponse(saved, tariff));
        }

        return results;
    }

    @Override
    @Transactional
    public InvoiceResponse confirmPayment(Long invoiceId, Long residentId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new AppException("Không tìm thấy hóa đơn ID: " + invoiceId));

        if (invoice.getApartment().getResident() == null ||
                !invoice.getApartment().getResident().getId().equals(residentId)) {
            throw new AppException("Bạn không có quyền xác nhận thanh toán cho hóa đơn này!", HttpStatus.FORBIDDEN);
        }

        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new AppException("Hóa đơn này đã được Ban Quản Lý phê duyệt thanh toán rồi!");
        }

        // BR-06: Chuyển sang trạng thái PENDING chờ BQL đối soát duyệt
        invoice.setStatus(InvoiceStatus.PENDING);
        Invoice saved = invoiceRepository.save(invoice);
        return enrichInvoiceResponse(saved, getOrInitTariff());
    }

    @Override
    @Transactional
    public InvoiceResponse approveInvoice(Long invoiceId, Long adminId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new AppException("Không tìm thấy hóa đơn ID: " + invoiceId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new AppException("Không tìm thấy Admin phê duyệt"));

        // BR-06: Duyệt thành công -> chuyển sang PAID
        invoice.setStatus(InvoiceStatus.PAID);
        invoice.setApprovedBy(admin);
        invoice.setPaidAt(LocalDateTime.now());

        Invoice saved = invoiceRepository.save(invoice);
        return enrichInvoiceResponse(saved, getOrInitTariff());
    }

    @Override
    @Transactional
    public InvoiceResponse rejectInvoice(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new AppException("Không tìm thấy hóa đơn ID: " + invoiceId));

        // BR-06: Từ chối đối soát -> chuyển lại về UNPAID
        invoice.setStatus(InvoiceStatus.UNPAID);
        invoice.setApprovedBy(null);
        invoice.setPaidAt(null);

        Invoice saved = invoiceRepository.save(invoice);
        return enrichInvoiceResponse(saved, getOrInitTariff());
    }

    private ServiceTariff getOrInitTariff() {
        return tariffRepository.findById(1).orElseGet(() -> {
            ServiceTariff defaultTariff = ServiceTariff.builder()
                    .id(1)
                    .managementFeePerSqm(new BigDecimal("10000.00"))
                    .electricityUnitPrice(new BigDecimal("3500.00"))
                    .waterUnitPrice(new BigDecimal("15000.00"))
                    .motorbikeFee(new BigDecimal("100000.00"))
                    .carFee(new BigDecimal("1200000.00"))
                    .updatedAt(LocalDateTime.now())
                    .build();
            return tariffRepository.save(defaultTariff);
        });
    }

    private InvoiceResponse enrichInvoiceResponse(Invoice invoice, ServiceTariff tariff) {
        InvoiceResponse response = InvoiceResponse.fromEntity(invoice);
        if (invoice.getApartment() != null) {
            Apartment apt = invoice.getApartment();
            long motoCount = vehicleRepository.countByApartmentIdAndVehicleType(apt.getId(), VehicleType.MOTORBIKE);
            long carCount = vehicleRepository.countByApartmentIdAndVehicleType(apt.getId(), VehicleType.CAR);

            BigDecimal mgmtFee = apt.getAreaSqm().multiply(tariff.getManagementFeePerSqm());
            BigDecimal elecAmount = BigDecimal.valueOf(response.getElectricUsage()).multiply(tariff.getElectricityUnitPrice());
            BigDecimal waterAmount = BigDecimal.valueOf(response.getWaterUsage()).multiply(tariff.getWaterUnitPrice());
            BigDecimal parkingFee = BigDecimal.valueOf(motoCount).multiply(tariff.getMotorbikeFee())
                    .add(BigDecimal.valueOf(carCount).multiply(tariff.getCarFee()));

            InvoiceBreakdown breakdown = InvoiceBreakdown.builder()
                    .areaSqm(apt.getAreaSqm())
                    .managementFeeRate(tariff.getManagementFeePerSqm())
                    .managementFee(mgmtFee)
                    .electricUsage(response.getElectricUsage())
                    .electricRate(tariff.getElectricityUnitPrice())
                    .electricAmount(elecAmount)
                    .waterUsage(response.getWaterUsage())
                    .waterRate(tariff.getWaterUnitPrice())
                    .waterAmount(waterAmount)
                    .motorbikeCount(motoCount)
                    .motorbikeFee(tariff.getMotorbikeFee())
                    .carCount(carCount)
                    .carFee(tariff.getCarFee())
                    .totalParkingFee(parkingFee)
                    .totalAmount(invoice.getTotalAmount())
                    .build();

            response.setBreakdown(breakdown);
        }
        return response;
    }
}
