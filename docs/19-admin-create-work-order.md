# Admin Membuat Work Order

## Endpoint

POST /api/work-orders

## Hak Akses

Hanya ADMIN.

## Request

Required:

- customerId
- title
- description
- scheduledAt

Optional:

- technicianId

## Work Order Number

workOrderNumber dibuat oleh backend.

Client tidak dapat menentukan nilainya.

## Creator

createdById diambil dari user yang terautentikasi melalui
request.auth.userId.

Client tidak dapat menentukan createdById.

## Status Awal

Jika technicianId tidak tersedia:

PENDING

Jika technicianId diberikan:

ASSIGNED

Status ditentukan oleh backend.

## Customer

Customer harus tersedia pada database.

## Technician

Jika technicianId dikirim:

- user harus tersedia
- role harus TECHNICIAN
- akun harus aktif

## Status History

Saat Work Order dibuat, initial status history juga dibuat.

previousStatus = null

newStatus = PENDING atau ASSIGNED

changedById = admin pembuat

## Transaction

Work Order dan initial status history dibuat dalam database
transaction.

## Error

- 401 jika tidak terautentikasi
- 403 jika bukan ADMIN
- 404 jika customer tidak ditemukan
- 404 jika technician tidak ditemukan
- 409 jika technician tidak aktif
- 422 jika request tidak valid
