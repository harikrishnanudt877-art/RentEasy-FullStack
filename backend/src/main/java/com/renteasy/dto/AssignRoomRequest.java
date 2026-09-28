package com.renteasy.dto;

import jakarta.validation.constraints.NotNull;

public class AssignRoomRequest {

    @NotNull(message = "Room ID is required")
    private Long roomId;

    public AssignRoomRequest() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }
}
