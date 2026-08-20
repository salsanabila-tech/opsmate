## Summary

Menambahkan endpoint detail Work Order untuk ADMIN.

## Changes

- Menambahkan validasi UUID workOrderId
- Menambahkan service getWorkOrderDetails
- Menambahkan controller detail Work Order
- Menambahkan GET /api/work-orders/:workOrderId
- Menampilkan customer, technician, dan createdBy
- Menampilkan status histories dan attachments
- Mengubah fileSize BigInt menjadi string untuk JSON
- Memperbaiki nama listWorkOrdersController
- Menyamakan format response menjadi success
- Memperbaiki invalid query agar menghasilkan 422

## Authorization

ADMIN only.

## Verification

- Detail Work Order berhasil: 200
- UUID tidak valid: 422
- Work Order tidak ditemukan: 404
- Tanpa token: 401
- Token TECHNICIAN: 403
- Typecheck berhasil
- Build berhasil
- Regression test berhasil
