package com.renteasy.service;

import com.renteasy.dto.AssignRoomRequest;
import com.renteasy.entity.Room;
import com.renteasy.entity.Tenant;
import com.renteasy.exception.BusinessRuleException;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.RoomRepository;
import com.renteasy.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;

    public TenantService(TenantRepository tenantRepository, RoomRepository roomRepository) {
        this.tenantRepository = tenantRepository;
        this.roomRepository = roomRepository;
    }

    public Tenant registerTenant(Tenant tenant) {
        if (tenantRepository.findByPhone(tenant.getPhone()).isPresent()) {
            throw new BusinessRuleException("A tenant with this phone number already exists.");
        }
        tenant.setActive(true);
        return tenantRepository.save(tenant);
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public List<Tenant> getActiveTenants() {
        return tenantRepository.findByActiveTrue();
    }

    public Tenant getTenant(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found with ID: " + id));
    }

    @Transactional
    public Tenant assignRoom(Long tenantId, AssignRoomRequest request) {
        Tenant tenant = getTenant(tenantId);

        if (!tenant.isActive()) {
            throw new BusinessRuleException("Cannot assign a room to an inactive/vacated tenant.");
        }

        if (tenant.getRoom() != null) {
            throw new BusinessRuleException("Tenant is already assigned to room " + tenant.getRoom().getRoomNumber());
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + request.getRoomId()));

        // REQUIRED BUSINESS RULE:
        // A room cannot be assigned to a new tenant while it is occupied.
        if (room.isOccupied()) {
            throw new BusinessRuleException("Room " + room.getRoomNumber() + " is already occupied.");
        }

        tenant.setRoom(room);
        room.setOccupied(true);

        roomRepository.save(room);
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant vacateTenant(Long tenantId) {
        Tenant tenant = getTenant(tenantId);

        if (!tenant.isActive()) {
            throw new BusinessRuleException("Tenant is already inactive/vacated.");
        }

        if (tenant.getRoom() != null) {
            Room room = tenant.getRoom();
            room.setOccupied(false);
            roomRepository.save(room);
            tenant.setRoom(null);
        }

        tenant.setActive(false);
        return tenantRepository.save(tenant);
    }

    public Tenant updateTenant(Long id, Tenant updated) {
        Tenant tenant = getTenant(id);

        if (updated.getPhone() != null &&
            !updated.getPhone().equals(tenant.getPhone()) &&
            tenantRepository.findByPhone(updated.getPhone()).isPresent()) {
            throw new BusinessRuleException("A tenant with this phone number already exists.");
        }

        tenant.setName(updated.getName());
        tenant.setPhone(updated.getPhone());
        tenant.setEmail(updated.getEmail());
        return tenantRepository.save(tenant);
    }
}
