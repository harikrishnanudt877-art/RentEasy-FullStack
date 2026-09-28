import axios from "axios";
import type {
  Tenant,
  Room,
  RentPayment,
} from "./types";

const API_BASE_URL = "http://localhost:8081/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// ROOMS
// =========================

export async function getRooms(): Promise<Room[]> {
  const { data } = await api.get<Room[]>("/rooms");
  return data;
}

export async function createRoom(payload: Partial<Room>): Promise<Room> {
  const { data } = await api.post<Room>("/rooms", payload);
  return data;
}

export async function updateRoom(
  roomId: number,
  payload: Partial<Room>
): Promise<Room> {
  const { data } = await api.put<Room>(`/rooms/${roomId}`, payload);
  return data;
}

export async function deleteRoom(roomId: number): Promise<void> {
  await api.delete(`/rooms/${roomId}`);
}

// =========================
// TENANTS
// =========================

export async function getTenants(): Promise<Tenant[]> {
  const { data } = await api.get<Tenant[]>("/tenants");
  return data;
}

export async function createTenant(payload: any): Promise<Tenant> {
  const requestBody = {
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    room: payload.roomId
      ? {
          roomId: Number(payload.roomId),
        }
      : null,
    moveInDate: payload.moveInDate,
    monthlyRent: Number(payload.monthlyRent || 0),
  };

  const { data } = await api.post<Tenant>("/tenants", requestBody);
  return data;
}

export async function updateTenant(
  tenantId: number,
  payload: any
): Promise<Tenant> {
  const requestBody = {
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    room: payload.roomId
      ? {
          roomId: Number(payload.roomId),
        }
      : null,
    moveInDate: payload.moveInDate,
    monthlyRent: Number(payload.monthlyRent || 0),
    active: payload.active ?? true,
  };

  const { data } = await api.put<Tenant>(
    `/tenants/${tenantId}`,
    requestBody
  );

  return data;
}

export async function deleteTenant(tenantId: number): Promise<void> {
  await api.delete(`/tenants/${tenantId}`);
}

// =========================
// PAYMENTS
// =========================

export async function getPayments(): Promise<RentPayment[]> {
  const { data } = await api.get<RentPayment[]>("/payments");
  return data;
}

export async function createPayment(payload: any): Promise<RentPayment> {
  const requestBody = {
    tenantId: Number(payload.tenantId),
    paymentMonth: payload.paymentMonth,
    amount: Number(payload.amount),
    paymentDate: payload.paymentDate,
    remarks: payload.remarks ?? payload.notes ?? "",
  };

  const { data } = await api.post<RentPayment>(
    "/payments",
    requestBody
  );

  return data;
}

// =========================
// PENDING DUES
// =========================

export async function getPendingDues(): Promise<Tenant[]> {
  const { data } = await api.get<Tenant[]>(
    "/payments/pending/current-month"
  );
  return data;
}

// =========================
// CURRENT UNPAID
// =========================

export async function getCurrentUnpaid(): Promise<Tenant[]> {
  const { data } = await api.get<Tenant[]>(
    "/payments/pending/current-month"
  );
  return data;
}