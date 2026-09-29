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

import java.math.BigDecimal;
import java.util.List;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;

    public TenantService(
            TenantRepository tenantRepository,
            RoomRepository roomRepository) {

        this.tenantRepository = tenantRepository;
        this.roomRepository = roomRepository;
    }

    // =========================================================
    // CREATE - REGISTER TENANT
    // =========================================================

    @Transactional
    public Tenant registerTenant(Tenant tenant) {

        if (tenantRepository.findByPhone(tenant.getPhone()).isPresent()) {
            throw new BusinessRuleException(
                    "A tenant with this phone number already exists."
            );
        }

        if (tenant.getMonthlyRent() == null) {
            tenant.setMonthlyRent(BigDecimal.ZERO);
        }

        if (tenant.getMonthlyRent().compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessRuleException(
                    "Monthly rent cannot be negative."
            );
        }

        tenant.setActive(true);

        // Assign room during registration if provided
        if (tenant.getRoom() != null &&
                tenant.getRoom().getRoomId() != null) {

            Long roomId = tenant.getRoom().getRoomId();

            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Room not found with ID: " + roomId
                            )
                    );

            if (room.isOccupied()) {
                throw new BusinessRuleException(
                        "Room " + room.getRoomNumber()
                                + " is already occupied."
                );
            }

            tenant.setRoom(room);

            room.setOccupied(true);

            roomRepository.save(room);
        }

        return tenantRepository.save(tenant);
    }

    // =========================================================
    // READ - GET ALL TENANTS
    // =========================================================

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    // =========================================================
    // READ - GET ACTIVE TENANTS
    // =========================================================

    public List<Tenant> getActiveTenants() {
        return tenantRepository.findByActiveTrue();
    }

    // =========================================================
    // READ - GET ONE TENANT
    // =========================================================

    public Tenant getTenant(Long id) {

        return tenantRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Tenant not found with ID: " + id
                        )
                );
    }

    // =========================================================
    // ASSIGN ROOM
    // =========================================================

    @Transactional
    public Tenant assignRoom(
            Long tenantId,
            AssignRoomRequest request) {

        Tenant tenant = getTenant(tenantId);

        if (!tenant.isActive()) {
            throw new BusinessRuleException(
                    "Cannot assign a room to an inactive/vacated tenant."
            );
        }

        if (tenant.getRoom() != null) {
            throw new BusinessRuleException(
                    "Tenant is already assigned to room "
                            + tenant.getRoom().getRoomNumber()
            );
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Room not found with ID: "
                                        + request.getRoomId()
                        )
                );

        if (room.isOccupied()) {
            throw new BusinessRuleException(
                    "Room " + room.getRoomNumber()
                            + " is already occupied."
            );
        }

        tenant.setRoom(room);

        room.setOccupied(true);

        roomRepository.save(room);

        return tenantRepository.save(tenant);
    }

    // =========================================================
    // VACATE TENANT
    // =========================================================

    @Transactional
    public Tenant vacateTenant(Long tenantId) {

        Tenant tenant = getTenant(tenantId);

        if (!tenant.isActive()) {
            throw new BusinessRuleException(
                    "Tenant is already inactive/vacated."
            );
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

    // =========================================================
    // UPDATE TENANT
    // =========================================================

    @Transactional
    public Tenant updateTenant(
            Long id,
            Tenant updated) {

        Tenant tenant = getTenant(id);

        // -----------------------------------------------------
        // CHECK DUPLICATE PHONE
        // -----------------------------------------------------

        if (updated.getPhone() != null
                && !updated.getPhone().equals(tenant.getPhone())
                && tenantRepository.findByPhone(updated.getPhone()).isPresent()) {

            throw new BusinessRuleException(
                    "A tenant with this phone number already exists."
            );
        }

        // -----------------------------------------------------
        // BASIC INFORMATION
        // -----------------------------------------------------

        if (updated.getName() != null) {
            tenant.setName(updated.getName());
        }

        if (updated.getPhone() != null) {
            tenant.setPhone(updated.getPhone());
        }

        if (updated.getEmail() != null) {
            tenant.setEmail(updated.getEmail());
        }

        // -----------------------------------------------------
        // MOVE-IN DATE
        // -----------------------------------------------------

        if (updated.getMoveInDate() != null) {
            tenant.setMoveInDate(updated.getMoveInDate());
        }

        // -----------------------------------------------------
        // ACTIVE STATUS
        // -----------------------------------------------------

        tenant.setActive(updated.isActive());

        // -----------------------------------------------------
        // MONTHLY RENT
        // -----------------------------------------------------

        if (updated.getMonthlyRent() != null) {

            if (updated.getMonthlyRent()
                    .compareTo(BigDecimal.ZERO) < 0) {

                throw new BusinessRuleException(
                        "Monthly rent cannot be negative."
                );
            }

            tenant.setMonthlyRent(
                    updated.getMonthlyRent()
            );
        }

        // -----------------------------------------------------
        // ROOM UPDATE
        // -----------------------------------------------------

        if (updated.getRoom() != null
                && updated.getRoom().getRoomId() != null) {

            Long newRoomId =
                    updated.getRoom().getRoomId();

            Long oldRoomId =
                    tenant.getRoom() != null
                            ? tenant.getRoom().getRoomId()
                            : null;

            // Only change if different room selected
            if (oldRoomId == null
                    || !oldRoomId.equals(newRoomId)) {

                Room newRoom = roomRepository
                        .findById(newRoomId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Room not found with ID: "
                                                + newRoomId
                                )
                        );

                if (newRoom.isOccupied()) {
                    throw new BusinessRuleException(
                            "Room "
                                    + newRoom.getRoomNumber()
                                    + " is already occupied."
                    );
                }

                // Free old room
                if (tenant.getRoom() != null) {

                    Room oldRoom = tenant.getRoom();

                    oldRoom.setOccupied(false);

                    roomRepository.save(oldRoom);
                }

                // Occupy new room
                newRoom.setOccupied(true);

                roomRepository.save(newRoom);

                tenant.setRoom(newRoom);
            }

        } else if (updated.getRoom() == null) {

            // Remove room assignment
            if (tenant.getRoom() != null) {

                Room oldRoom = tenant.getRoom();

                oldRoom.setOccupied(false);

                roomRepository.save(oldRoom);

                tenant.setRoom(null);
            }
        }

        return tenantRepository.save(tenant);
    }

    // =========================================================
    // DELETE TENANT
    // =========================================================

    @Transactional
    public void deleteTenant(Long tenantId) {

        Tenant tenant = getTenant(tenantId);

        // -----------------------------------------------------
        // FREE ROOM BEFORE DELETING TENANT
        // -----------------------------------------------------

        if (tenant.getRoom() != null) {

            Room room = tenant.getRoom();

            room.setOccupied(false);

            roomRepository.save(room);

            tenant.setRoom(null);
        }

        // -----------------------------------------------------
        // DELETE TENANT
        // -----------------------------------------------------

        tenantRepository.delete(tenant);
    }
}