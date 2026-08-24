# Web Admin Work Order Detail

## Summary

Menambahkan halaman detail Work Order
untuk OpsMate Web Admin.

## Endpoint

GET /api/work-orders/:workOrderId

## Features

- Clickable Work Order rows
- Dynamic Work Order route
- Work Order number
- Status
- Title
- Description
- Scheduled date
- Created date
- Updated date
- Completed date
- Customer information
- Technician information
- Unassigned technician state
- Created by information
- BEFORE evidence
- AFTER evidence
- OTHER attachment
- Evidence image preview
- Status history timeline
- Manual refresh
- Loading state
- Error state
- Back navigation

## Authorization

ADMIN only.

## Verification

- Admin dapat membuka detail
- Pending Work Order tidak crash
- Customer detail tampil
- Technician detail tampil
- Evidence BEFORE tampil
- Evidence AFTER tampil
- Image dapat dibuka
- Status timeline tampil
- Refresh berhasil
- Invalid Work Order menampilkan error
- Automatic token refresh tetap bekerja
- npm run lint berhasil
- npm run build berhasil
