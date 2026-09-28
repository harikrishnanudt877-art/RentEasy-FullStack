# RentEasy Frontend

React + Vite + TypeScript + Tailwind CSS frontend for the RentEasy PG/Hostel Room Rent Payment Tracker.

## Features
- Dashboard
- Register tenant and assign room
- Room management
- Monthly rent payment logging
- Pending dues
- Current-month unpaid tenants
- Responsive admin UI
- INR currency display
- REST API integration with Spring Boot

## Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

The Spring Boot backend in the current project is running on http://localhost:8081.

## Expected API mappings

The frontend currently expects:
- GET/POST /tenants
- GET /rooms
- POST /rooms
- GET /payments
- POST /payments
- GET /payments/pending
- GET /payments/unpaid/current

If your controller mappings differ, edit `src/api.ts` only.

## Structure

```text
frontend/
├── src/
│   ├── App.tsx
│   ├── api.ts
│   ├── types.ts
│   ├── index.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```