# Technician Work Order Status Workflow

## Summary

Menambahkan workflow perubahan status Work Order oleh TECHNICIAN.

## Endpoint

PATCH /api/work-orders/my/:workOrderId/status

## Authorization

TECHNICIAN only.

Technician hanya dapat memperbarui Work Order yang ditugaskan kepadanya.

## Allowed Workflow

ASSIGNED
→ ON_THE_WAY
→ IN_PROGRESS
→ COMPLETED

Status tidak dapat dilewati atau dikembalikan ke status sebelumnya.

## Allowed Target Status

- ON_THE_WAY
- IN_PROGRESS
- COMPLETED

Technician tidak dapat mengubah status menjadi:

- PENDING
- ASSIGNED
- CANCELLED

## Resource Ownership

Backend menggunakan:

- workOrderId dari route parameter
- technicianId dari request.auth.userId

Client tidak dapat menentukan technicianId secara manual.

## Transaction

Perubahan status Work Order dan pembuatan status history dilakukan dalam satu database transaction.

Jika salah satu operasi gagal, seluruh perubahan dibatalkan.

## Audit Trail

Setiap perubahan menyimpan:

- workOrderId
- previousStatus
- newStatus
- changedById
- notes
- createdAt

## Completed At

Saat status berubah menjadi COMPLETED, backend otomatis mengisi completedAt.

Client tidak dapat menentukan completedAt.

## Security

- Work Order milik teknisi lain menghasilkan 404
- Invalid status menghasilkan 422
- Invalid transition menghasilkan 409
- Concurrent status change menghasilkan 409
- Tanpa token menghasilkan 401
- ADMIN menghasilkan 403

## Verification

- ASSIGNED → ON_THE_WAY berhasil
- ON_THE_WAY → IN_PROGRESS berhasil
- IN_PROGRESS → COMPLETED berhasil
- ASSIGNED → COMPLETED ditolak
- ON_THE_WAY → COMPLETED ditolak
- Backward transition ditolak
- Same status transition ditolak
- CANCELLED ditolak
- Work Order milik teknisi lain ditolak
- Status history berhasil dibuat
- changedById sesuai teknisi login
- completedAt terisi saat COMPLETED
- Typecheck berhasil
- Build berhasil
- Regression test berhasil
