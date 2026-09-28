package com.renteasy.service;

import com.renteasy.entity.Room;
import com.renteasy.exception.BusinessRuleException;
import com.renteasy.exception.ResourceNotFoundException;
import com.renteasy.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public Room createRoom(Room room) {
        if (roomRepository.findByRoomNumber(room.getRoomNumber()).isPresent()) {
            throw new BusinessRuleException("Room number already exists.");
        }
        room.setOccupied(false);
        return roomRepository.save(room);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getAvailableRooms() {
        return roomRepository.findByOccupiedFalse();
    }

    public Room getRoom(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
    }

    public Room updateRoom(Long id, Room updated) {
        Room room = getRoom(id);

        if (updated.getRoomNumber() != null &&
            !updated.getRoomNumber().equals(room.getRoomNumber()) &&
            roomRepository.findByRoomNumber(updated.getRoomNumber()).isPresent()) {
            throw new BusinessRuleException("Room number already exists.");
        }

        if (room.isOccupied() && updated.getMonthlyRent() != null &&
            updated.getMonthlyRent().compareTo(room.getMonthlyRent()) != 0) {
            throw new BusinessRuleException("Cannot change rent of an occupied room in this simple version.");
        }

        room.setRoomNumber(updated.getRoomNumber());
        room.setRoomType(updated.getRoomType());
        room.setMonthlyRent(updated.getMonthlyRent());

        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = getRoom(id);
        if (room.isOccupied()) {
            throw new BusinessRuleException("Cannot delete an occupied room. Vacate the tenant first.");
        }
        roomRepository.delete(room);
    }
}
