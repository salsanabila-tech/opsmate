## Summary

Implementasi fitur Admin List Work Orders untuk memungkinkan ADMIN melihat daftar Work Order melalui endpoint GET /api/work-orders.

## Changes

- Menambahkan validation query menggunakan Zod
- Menambahkan pagination menggunakan skip dan take
- Menambahkan search berdasarkan work order number dan title
- Menambahkan filter berdasarkan status
- Menambahkan filter berdasarkan technician
- Menambahkan filter berdasarkan customer
- Menambahkan filter berdasarkan scheduled date
- Menambahkan total data dan pagination metadata
- Menambahkan relasi customer, technician, dan createdBy
- Menambahkan authorization ADMIN
- Menambahkan validasi query yang tidak valid
- Memastikan password hash dan data sensitif tidak dikembalikan

## Endpoint

GET /api/work-orders

## Authorization

ADMIN only.

## Validation

- Invalid pagination → 422
- Invalid status → 422
- Invalid UUID → 422
- Invalid date → 422
- Invalid date range → 422
- Unknown query parameter → 422

## Security

- Tanpa access token → 401
- TECHNICIAN → 403
- Password hash tidak dikembalikan

## Verification

- Typecheck berhasil
- Build berhasil
- Pagination berhasil
- Search berhasil
- Status filter berhasil
- Technician filter berhasil
- Customer filter berhasil
- Date range filter berhasil
