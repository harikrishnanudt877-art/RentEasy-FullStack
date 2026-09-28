package com.renteasy.controller;

import com.renteasy.dto.RentPaymentRequest;
import com.renteasy.entity.RentPayment;
import com.renteasy.entity.Tenant;
import com.renteasy.service.RentPaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class RentPaymentController {

    private final RentPaymentService rentPaymentService;

    public RentPaymentController(RentPaymentService rentPaymentService) {
        this.rentPaymentService = rentPaymentService;
    }

    @PostMapping
    public ResponseEntity<RentPayment> recordPayment(
            @Valid @RequestBody RentPaymentRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rentPaymentService.recordPayment(request));
    }

    @GetMapping
    public ResponseEntity<List<RentPayment>> getAllPayments() {
        return ResponseEntity.ok(rentPaymentService.getAllPayments());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Tenant>> getPendingTenants() {
        return ResponseEntity.ok(
                rentPaymentService.getTenantsWithCurrentMonthPending()
        );
    }

    @GetMapping("/pending/current-month")
    public ResponseEntity<List<Tenant>> getCurrentMonthPendingTenants() {
        return ResponseEntity.ok(
                rentPaymentService.getTenantsWithCurrentMonthPending()
        );
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<RentPayment>> getPaymentsForTenant(
            @PathVariable Long tenantId) {

        return ResponseEntity.ok(
                rentPaymentService.getPaymentsForTenant(tenantId)
        );
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<RentPayment> getPayment(
            @PathVariable Long paymentId) {

        return ResponseEntity.ok(
                rentPaymentService.getPayment(paymentId)
        );
    }

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable Long paymentId) {

        rentPaymentService.deletePayment(paymentId);
        return ResponseEntity.noContent().build();
    }
}