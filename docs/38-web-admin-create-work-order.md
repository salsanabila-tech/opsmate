# Web Admin Create Work Order

## Summary

Menambahkan pembuatan Work Order
melalui OpsMate Web Admin.

## Endpoint

POST /api/work-orders

## Fields

- customerId
- technicianId optional
- title
- description
- scheduledAt

## Initial Status

Tanpa technician:

PENDING

Dengan technician:

ASSIGNED

## Features

- Customer selector
- Active technician selector
- Optional technician assignment
- Work Order title
- Work Order description
- Date/time scheduling
- Client validation
- Loading state
- Error state
- Status preview
- Automatic query invalidation
- Redirect to created Work Order detail

## Validation

- Customer required
- Title minimum 3 characters
- Title maximum 150 characters
- Description minimum 5 characters
- Description maximum 5000 characters
- Scheduled date must be in the future
- Only active technicians are selectable

## Verification

- PENDING Work Order berhasil dibuat
- ASSIGNED Work Order berhasil dibuat
- Customer validation bekerja
- Technician assignment bekerja
- Inactive technician tidak muncul
- Past date ditolak
- Dashboard diperbarui
- Work Order list diperbarui
- Redirect ke detail berhasil
- Automatic token refresh tetap berjalan
- npm run lint berhasil
- npm run build berhasil
