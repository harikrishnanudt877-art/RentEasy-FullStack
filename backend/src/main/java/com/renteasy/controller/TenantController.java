package com.renteasy.controller;

import com.renteasy.dto.AssignRoomRequest;
import com.renteasy.entity.Tenant;
import com.renteasy.service.RentPaymentService;
import com.renteasy.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "*")
public class TenantController {

    private final TenantService tenantService;
    private final RentPaymentService rentPaymentService;

    public TenantController(TenantService tenantService, RentPaymentService rentPaymentService) {
        this.tenantService = tenantService;
        this.rentPaymentService = rentPaymentService;
    }

    @PostMapping
    public ResponseEntity<Tenant> registerTenant(@Valid @RequestBody Tenant tenant) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tenantService.registerTenant(tenant));
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Tenant>> getActiveTenants() {
        return ResponseEntity.ok(tenantService.getActiveTenants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenant(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.getTenant(id));
    }

    @PutMapping("/{tenantId}/room")
    public ResponseEntity<Tenant> assignRoom(
            @PathVariable Long tenantId,
            @Valid @RequestBody AssignRoomRequest request) {
        return ResponseEntity.ok(tenantService.assignRoom(tenantId, request));
    }

    @PutMapping("/{id}/vacate")
    public ResponseEntity<Tenant> vacateTenant(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.vacateTenant(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.updateTenant(id, tenant));
    }

    @GetMapping("/{id}/dues")
    public ResponseEntity<Map<String, Object>> getPendingDues(@PathVariable Long id) {
        Tenant tenant = tenantService.getTenant(id);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("tenantId", tenant.getTenantId());
        response.put("tenantName", tenant.getName());
        response.put("roomNumber",
                tenant.getRoom() != null ? tenant.getRoom().getRoomNumber() : null);
        response.put("pendingMonths", rentPaymentService.calculatePendingDues(id));

        return ResponseEntity.ok(response);
    }
}
