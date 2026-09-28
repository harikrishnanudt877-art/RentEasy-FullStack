package com.renteasy.service;

import com.renteasy.dto.RentPaymentRequest;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Tenant;
import com.renteasy.exception.BusinessRuleException;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.RentPaymentRepository;
import com.renteasy.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class RentPaymentService {

    private final RentPaymentRepository paymentRepository;
    private final TenantRepository tenantRepository;

    public RentPaymentService(RentPaymentRepository paymentRepository,
                              TenantRepository tenantRepository) {
        this.paymentRepository = paymentRepository;
        this.tenantRepository = tenantRepository;
    }

    public RentPayment recordPayment(RentPaymentRequest request) {
        Tenant tenant = tenantRepository.findById(request.getTenantId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tenant not found with ID: " + request.getTenantId()));

        if (!tenant.isActive()) {
            throw new BusinessRuleException("Cannot record rent for an inactive/vacated tenant.");
        }

        if (tenant.getRoom() == null) {
            throw new BusinessRuleException("Tenant has no assigned room.");
        }

        YearMonth requestedMonth = parseMonth(request.getPaymentMonth());
        YearMonth currentMonth = YearMonth.now();

        if (requestedMonth.isAfter(currentMonth)) {
            throw new BusinessRuleException("Cannot record payment for a future month.");
        }

        if (requestedMonth.isBefore(YearMonth.from(tenant.getMoveInDate()))) {
            throw new BusinessRuleException("Cannot record payment for a month before the tenant moved in.");
        }

        if (paymentRepository.existsByTenantTenantIdAndPaymentMonth(
                tenant.getTenantId(), request.getPaymentMonth())) {
            throw new BusinessRuleException(
                    "Rent for " + request.getPaymentMonth() + " has already been recorded for this tenant.");
        }

        BigDecimal requiredRent = tenant.getRoom().getMonthlyRent();

        if (request.getAmount().compareTo(requiredRent) < 0) {
            throw new BusinessRuleException(
                    "Payment amount is less than the monthly rent of " + requiredRent);
        }

        RentPayment payment = new RentPayment();
        payment.setTenant(tenant);
        payment.setPaymentMonth(request.getPaymentMonth());
        payment.setAmount(request.getAmount());
        payment.setPaymentDate(LocalDate.now());
        payment.setRemarks(request.getRemarks());

        return paymentRepository.save(payment);
    }

    public List<RentPayment> getPaymentsForTenant(Long tenantId) {
        if (!tenantRepository.existsById(tenantId)) {
            throw new ResourceNotFoundException("Tenant not found with ID: " + tenantId);
        }
        return paymentRepository.findByTenantTenantIdOrderByPaymentMonthDesc(tenantId);
    }

    public RentPayment getPayment(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));
    }

    public long calculatePendingDues(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with ID: " + tenantId));

        if (!tenant.isActive() || tenant.getRoom() == null) {
            return 0;
        }

        YearMonth moveInMonth = YearMonth.from(tenant.getMoveInDate());
        YearMonth currentMonth = YearMonth.now();

        long monthsSinceMoveIn = 0;

        if (!currentMonth.isBefore(moveInMonth)) {
            monthsSinceMoveIn = ChronoUnit.MONTHS.between(moveInMonth, currentMonth) + 1;
        }

        long monthsPaid = paymentRepository
                .findByTenantTenantIdOrderByPaymentMonthDesc(tenantId)
                .stream()
                .map(RentPayment::getPaymentMonth)
                .map(this::parseMonth)
                .filter(month -> !month.isBefore(moveInMonth) && !month.isAfter(currentMonth))
                .distinct()
                .count();

        // REQUIRED BUSINESS RULE:
        // Pending dues = months since move-in - months paid.
        return Math.max(0, monthsSinceMoveIn - monthsPaid);
    }

    public List<Tenant> getTenantsWithCurrentMonthPending() {
        String currentMonth = YearMonth.now().toString();

        List<Tenant> activeTenants = tenantRepository.findByActiveTrue();
        List<Tenant> pending = new ArrayList<>();

        for (Tenant tenant : activeTenants) {
            if (tenant.getRoom() != null &&
                !paymentRepository.existsByTenantTenantIdAndPaymentMonth(
                        tenant.getTenantId(), currentMonth)) {
                pending.add(tenant);
            }
        }

        return pending;
    }

    public List<RentPayment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public void deletePayment(Long paymentId) {
        RentPayment payment = getPayment(paymentId);
        paymentRepository.delete(payment);
    }

    private YearMonth parseMonth(String month) {
        try {
            return YearMonth.parse(month);
        } catch (Exception ex) {
            throw new BusinessRuleException("Payment month must be in YYYY-MM format.");
        }
    }
}
