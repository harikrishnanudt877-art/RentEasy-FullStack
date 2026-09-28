# Postman Testing Sequence

Use `http://localhost:8080` as the base URL.

## Step 1 — Create two rooms

POST `/api/rooms`

```json
{
  "roomNumber": "A101",
  "roomType": "Single",
  "monthlyRent": 7500
}
```

POST `/api/rooms`

```json
{
  "roomNumber": "A102",
  "roomType": "Double",
  "monthlyRent": 9000
}
```

## Step 2 — Register two tenants

POST `/api/tenants`

```json
{
  "name": "Arun Kumar",
  "phone": "9876543210",
  "email": "arun@example.com",
  "moveInDate": "2026-09-01"
}
```

POST `/api/tenants`

```json
{
  "name": "Bala Kumar",
  "phone": "9876543211",
  "email": "bala@example.com",
  "moveInDate": "2026-09-01"
}
```

## Step 3 — Assign rooms

PUT `/api/tenants/1/room`

```json
{
  "roomId": 1
}
```

PUT `/api/tenants/2/room`

```json
{
  "roomId": 2
}
```

## Step 4 — Test occupied-room rule

Try:

PUT `/api/tenants/2/room`

```json
{
  "roomId": 1
}
```

Expected: HTTP 400 — Room A101 is already occupied.

## Step 5 — Record rent

POST `/api/payments`

```json
{
  "tenantId": 1,
  "paymentMonth": "2026-09",
  "amount": 7500,
  "remarks": "Cash"
}
```

## Step 6 — Check dues

GET `/api/tenants/1/dues`

After payment, expected:

```json
{
  "tenantId": 1,
  "tenantName": "Arun Kumar",
  "roomNumber": "A101",
  "pendingMonths": 0
}
```

## Step 7 — Check current-month pending list

GET `/api/payments/pending/current-month`

Tenant 2 should appear because tenant 2 has not paid September rent.

## Step 8 — Vacate tenant

PUT `/api/tenants/1/vacate`

Then:

GET `/api/rooms/available`

Room A101 should now appear as available.

## Step 9 — Reuse freed room

Assign Room 1 to another active tenant:

PUT `/api/tenants/2/room`

Only do this after tenant 2 has no room. For the cleanest demonstration, create a third tenant and assign the freed room to that tenant.

## Edge cases to demonstrate
- Duplicate tenant phone → rejected.
- Duplicate room number → rejected.
- Occupied room assignment → rejected.
- Future payment month → rejected.
- Payment before move-in month → rejected.
- Payment below room monthly rent → rejected.
- Duplicate payment for same tenant/month → rejected.
- Vacating an already inactive tenant → rejected.
- Deleting occupied room → rejected.
- Invalid/missing fields → validation error.
