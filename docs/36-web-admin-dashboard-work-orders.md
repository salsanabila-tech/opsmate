# Web Admin Dashboard and Work Orders

## Summary

Menambahkan dashboard operasional dan
Work Order table untuk OpsMate Web Admin.

## Dashboard

Dashboard menampilkan:

- Total Work Orders
- Completed Work Orders
- Total Customers
- Total Technicians
- Work Order snapshot
- Manual refresh

## Work Orders

Endpoint:

GET /api/work-orders

## Features

- Desktop Work Order table
- Search
- Status filter
- Pagination
- Refresh
- Loading state
- Error state
- Empty state
- Customer information
- Technician information
- Work Order status
- Scheduled date
- Created by information

## Filters

- ALL
- PENDING
- ASSIGNED
- ON_THE_WAY
- IN_PROGRESS
- COMPLETED
- CANCELLED

## Dashboard Sources

- GET /api/work-orders
- GET /api/work-orders?status=COMPLETED
- GET /api/customers
- GET /api/users/technicians

## Authorization

ADMIN only.

## Verification

- Dashboard KPI berhasil dimuat
- Work Order snapshot berhasil
- Work Order table berhasil
- Search berhasil
- Status filter berhasil
- Pagination berhasil
- Refresh berhasil
- Empty state berhasil
- Pending tanpa technician tidak crash
- Automatic token refresh tetap berjalan
- npm run lint berhasil
- npm run build berhasil
