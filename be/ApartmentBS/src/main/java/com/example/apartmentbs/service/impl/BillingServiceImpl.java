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

/**
 * Triển khai nghiệp vụ tính phí dịch vụ và chu trình quản lý hóa đơn (BillingServiceImpl).
 * 
 * Nghiệp vụ tính phí (BR-05):
 *  - Phí quản lý = Diện tích căn hộ (m2) * Đơn giá quản lý / m2.
 *  - Tiền điện = (Chỉ số điện mới - Chỉ số điện cũ) * Đơn giá điện.
 *  - Tiền nước = (Chỉ số nước mới - Chỉ số nước cũ) * Đơn giá nước.
 *  - Phí gửi xe = (Số lượng xe máy * Phí xe máy) + (Số lượng ô tô * Phí ô tô).
 *  - Tổng thanh toán = Phí quản lý + Tiền điện + Tiền nước + Phí gửi xe.
 * 
 * Vòng đời phê duyệt thanh toán (BR-06):
 *  - UNPAID -> Cư dân xác nhận chuyển khoản -> PENDING.
 *  - PENDING -> Ban Quản Lý đối soát ngân hàng khớp lệnh -> PAID (Lưu admin duyệt và paidAt).
 *  - PENDING -> Ban Quản Lý từ chối nếu không thấy tiền -> UNPAID.
 */
@Service
@RequiredArgsConstructor
public class BillingServiceImpl implements BillingService {

    private final ServiceTariffRepository tariffRepository;
    private final InvoiceRepository invoiceRepository;
    private final ApartmentRepository apartmentRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    /**
     * Lấy biểu phí hiện hành (khởi tạo mặc định nếu bảng csdl chưa có).
     */
    @Override
    @Transactional(readOnly = true)
    public TariffResponse getTariff() {
        ServiceTariff tariff = getOrInitTariff();
        return TariffResponse.fromEntity(tariff);
    }

    /**
     * Cập nhật biểu phí dịch vụ tòa nhà (Dành riêng cho ADMIN).
     */
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

    /**
     * Tìm kiếm hóa đơn không phân trang theo kỳ, trạng thái hoặc căn hộ.
     */
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

    /**
     * Tìm kiếm hóa đơn có phân trang và sắp xếp.
     */
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

    /**
     * Lấy chi tiết một hóa đơn kèm bảng chi tiết phí (InvoiceBreakdown).
     */
    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new AppException("Không tìm thấy hóa đơn có ID: " + id, HttpStatus.NOT_FOUND));
        return enrichInvoiceResponse(invoice, getOrInitTariff());
    }

    /**
     * Lấy toàn bộ hóa đơn của một căn hộ cụ thể.
     */
    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByApartment(Long apartmentId) {
        ServiceTariff tariff = getOrInitTariff();
        return invoiceRepository.findByApartmentIdOrderByBillingMonthDesc(apartmentId).stream()
                .map(inv -> enrichInvoiceResponse(inv, tariff))
                .collect(Collectors.toList());
    }

    /**
     * Chốt số công tơ và sinh hóa đơn hàng loạt (Batch Invoice Generation - BR-05):
     * - Chỉ tạo cho các căn hộ đang có người ở (OCCUPIED).
     * - Kiểm tra tính hợp lệ: Số mới >= Số cũ.
     * - Tính toán phí quản lý, điện, nước, phương tiện dựa trên biểu phí hiện hành.
     * - Lưu hóa đơn với trạng thái UNPAID và hạn nộp (dueDate).
     */
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

    /**
     * Cư dân xác nhận đã thanh toán chuyển khoản (BR-06):
     * Kiểm tra quyền sở hữu căn hộ, chuyển hóa đơn sang PENDING chờ đối soát.
     */
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

    /**
     * Ban Quản Lý duyệt thanh toán thành công (BR-06):
     * Cập nhật trạng thái PAID, ghi nhận Admin duyệt và thời điểm thanh toán (paidAt).
     */
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

    /**
     * Ban Quản Lý từ chối xác nhận thanh toán do chưa nhận được tiền (BR-06):
     * Đưa trạng thái hóa đơn quay trở lại UNPAID.
     */
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

    /**
     * Lấy hoặc khởi tạo cấu hình biểu phí dịch vụ mặc định (Tariff ID = 1).
     */
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

    /**
     * Bổ sung bảng phân tích chi phí chi tiết (Breakdown) vào InvoiceResponse.
     */
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
