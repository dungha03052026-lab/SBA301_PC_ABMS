package com.example.apartmentbs.service;

import com.example.apartmentbs.dto.request.BatchInvoiceCreateRequest;
import com.example.apartmentbs.dto.request.TariffRequest;
import com.example.apartmentbs.dto.response.InvoiceResponse;
import com.example.apartmentbs.dto.response.PageResponse;
import com.example.apartmentbs.dto.response.TariffResponse;
import com.example.apartmentbs.model.InvoiceStatus;

import java.util.List;

public interface BillingService {
    TariffResponse getTariff();
    TariffResponse updateTariff(TariffRequest request);

    List<InvoiceResponse> searchInvoices(String billingMonth, InvoiceStatus status, Long apartmentId);
    PageResponse<InvoiceResponse> searchInvoicesPaged(String billingMonth, InvoiceStatus status, Long apartmentId, int page, int size, String sortBy, String sortDir);
    InvoiceResponse getInvoiceById(Long id);
    List<InvoiceResponse> getInvoicesByApartment(Long apartmentId);

    List<InvoiceResponse> batchGenerateInvoices(BatchInvoiceCreateRequest request);
    InvoiceResponse confirmPayment(Long invoiceId, Long residentId);
    InvoiceResponse approveInvoice(Long invoiceId, Long adminId);
    InvoiceResponse rejectInvoice(Long invoiceId);
}
