# RentEasy — PG/Hostel Room Rent Payment Tracker

## Project
Spring Boot + Spring Data JPA + MySQL backend for tracking tenants, rooms and monthly rent payments.

## Requirements covered from the assessment
1. Register a tenant and assign them to a room with monthly rent.
2. Log a rent payment for a specific month.
3. View pending dues per tenant.
4. List tenants who have not paid for the current month.
5. Vacate a tenant and free the room.
6. Business rule: an occupied room cannot be assigned to another tenant.
7. Business rule: pending dues = months since move-in - months paid.
8. Business rules are enforced in the Service layer.
9. Input validation using Jakarta Validation.
10. Global exception handling using `@RestControllerAdvice`.
11. REST APIs with meaningful HTTP status codes.
12. Spring Data JPA repositories.
13. MySQL database integration.

## Software needed
- JDK 17
- Maven 3.9+
- MySQL 8.x
- Postman or Swagger-compatible API client
- IntelliJ IDEA / Eclipse / VS Code

## 1. Create the database
Open MySQL Workbench or MySQL command line:

```sql
CREATE DATABASE renteasy_db;
```

## 2. Configure MySQL password
Open:

`src/main/resources/application.properties`

Change:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

to your actual MySQL root password.

## 3. Run the project

From the project root:

```bash
mvn clean install
mvn spring-boot:run
```

The server runs at:

`http://localhost:8080`

## 4. Important API endpoints

### Rooms

Create room:
`POST /api/rooms`

```json
{
  "roomNumber": "A101",
  "roomType": "Single",
  "monthlyRent": 7500
}
```

Get all rooms:
`GET /api/rooms`

Get available rooms:
`GET /api/rooms/available`

Get one room:
`GET /api/rooms/1`

Update room:
`PUT /api/rooms/1`

Delete room:
`DELETE /api/rooms/1`

### Tenants

Register tenant:
`POST /api/tenants`

```json
{
  "name": "Arun Kumar",
  "phone": "9876543210",
  "email": "arun@example.com",
  "moveInDate": "2026-09-01"
}
```

Get all tenants:
`GET /api/tenants`

Get active tenants:
`GET /api/tenants/active`

Get one tenant:
`GET /api/tenants/1`

Assign room:
`PUT /api/tenants/1/room`

```json
{
  "roomId": 1
}
```

Vacate tenant:
`PUT /api/tenants/1/vacate`

Pending dues:
`GET /api/tenants/1/dues`

### Rent Payments

Record payment:
`POST /api/payments`

```json
{
  "tenantId": 1,
  "paymentMonth": "2026-09",
  "amount": 7500,
  "remarks": "Cash payment"
}
```

Get all payments:
`GET /api/payments`

Get tenant payment history:
`GET /api/payments/tenant/1`

Get current-month pending tenants:
`GET /api/payments/pending/current-month`

Get payment:
`GET /api/payments/1`

Delete payment:
`DELETE /api/payments/1`

## Business rule demonstrations for viva

### Rule 1 — Occupied room
Assign Room 1 to Tenant 1.

Try assigning Room 1 to Tenant 2.

Expected result: HTTP 400 with:

`Room A101 is already occupied.`

### Rule 2 — Pending dues
If a tenant moved in during September and the current month is September:
- Months since move-in = 1
- Months paid = 0
- Pending dues = 1

After recording September payment:
- Months since move-in = 1
- Months paid = 1
- Pending dues = 0

### Rule 3 — Duplicate payment
Try recording the same tenant's September payment twice.

Expected result: HTTP 400.

### Rule 4 — Future payment
Try payment month `2026-10` when current month is September 2026.

Expected result: HTTP 400.

### Rule 5 — Vacating
After `PUT /api/tenants/{id}/vacate`:
- Tenant becomes inactive.
- Assigned room becomes available.
- Room can be assigned to another active tenant.

## Architecture

Controller
→ Service
→ Repository
→ MySQL

Entities:
- Tenant
- Room
- RentPayment

## Assessment / viva points

Explain:
- `@Entity`, `@Id`, `@GeneratedValue`
- `@ManyToOne`
- Spring Data `JpaRepository`
- Service layer business rules
- `@Valid` and validation annotations
- `@RestControllerAdvice`
- HTTP 200, 201, 204, 400, 404 and 409
- JPA/Hibernate database mapping
- Why duplicate payments are prevented
- How pending dues are calculated

## Note
The project intentionally keeps authentication/security out because the supplied assessment question does not require login/authentication. This keeps the implementation focused on the assessed requirements.
