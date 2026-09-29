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

    public TenantController(
            TenantService tenantService,
            RentPaymentService rentPaymentService) {

        this.tenantService = tenantService;
        this.rentPaymentService = rentPaymentService;
    }

    // =========================================================
    // CREATE - Register a new tenant
    // POST /api/tenants
    // =========================================================
    @PostMapping
    public ResponseEntity<Tenant> registerTenant(
            @Valid @RequestBody Tenant tenant) {

        Tenant savedTenant = tenantService.registerTenant(tenant);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTenant);
    }

    // =========================================================
    // READ - Get all tenants
    // GET /api/tenants
    // =========================================================
    @GetMapping
    public ResponseEntity<List<Tenant>> getAllTenants() {

        return ResponseEntity.ok(
                tenantService.getAllTenants()
        );
    }

    // =========================================================
    // READ - Get active tenants
    // GET /api/tenants/active
    // =========================================================
    @GetMapping("/active")
    public ResponseEntity<List<Tenant>> getActiveTenants() {

        return ResponseEntity.ok(
                tenantService.getActiveTenants()
        );
    }

    // =========================================================
    // READ - Get tenant by ID
    // GET /api/tenants/{id}
    // =========================================================
    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenant(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                tenantService.getTenant(id)
        );
    }

    // =========================================================
    // UPDATE - Assign room to tenant
    // PUT /api/tenants/{tenantId}/room
    // =========================================================
    @PutMapping("/{tenantId}/room")
    public ResponseEntity<Tenant> assignRoom(
            @PathVariable Long tenantId,
            @Valid @RequestBody AssignRoomRequest request) {

        return ResponseEntity.ok(
                tenantService.assignRoom(tenantId, request)
        );
    }

    // =========================================================
    // UPDATE - Vacate tenant
    // PUT /api/tenants/{id}/vacate
    // =========================================================
    @PutMapping("/{id}/vacate")
    public ResponseEntity<Tenant> vacateTenant(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                tenantService.vacateTenant(id)
        );
    }

    // =========================================================
    // UPDATE - Update tenant details
    // PUT /api/tenants/{id}
    // =========================================================
    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody Tenant tenant) {

        Tenant updatedTenant =
                tenantService.updateTenant(id, tenant);

        return ResponseEntity.ok(updatedTenant);
    }

    // =========================================================
    // DELETE - Delete tenant
    // DELETE /api/tenants/{id}
    // =========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTenant(
            @PathVariable Long id) {

        tenantService.deleteTenant(id);

        Map<String, String> response = new LinkedHashMap<>();

        response.put(
                "message",
                "Tenant deleted successfully"
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // READ - Get pending dues for tenant
    // GET /api/tenants/{id}/dues
    // =========================================================
    @GetMapping("/{id}/dues")
    public ResponseEntity<Map<String, Object>> getPendingDues(
            @PathVariable Long id) {

        Tenant tenant = tenantService.getTenant(id);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put(
                "tenantId",
                tenant.getTenantId()
        );

        response.put(
                "tenantName",
                tenant.getName()
        );

        response.put(
                "roomNumber",
                tenant.getRoom() != null
                        ? tenant.getRoom().getRoomNumber()
                        : null
        );

        response.put(
                "pendingMonths",
                rentPaymentService.calculatePendingDues(id)
        );

        return ResponseEntity.ok(response);
    }
}