# Mobile Technician Status Workflow

## Summary

Menambahkan workflow perubahan status Work Order
untuk Technician pada aplikasi mobile OpsMate.

## Endpoint

PATCH /api/work-orders/my/:workOrderId/status

## Workflow

ASSIGNED
→ ON_THE_WAY

ON_THE_WAY
→ IN_PROGRESS

IN_PROGRESS
→ COMPLETED

## Evidence Rules

ON_THE_WAY → IN_PROGRESS
membutuhkan minimal satu BEFORE evidence.

IN_PROGRESS → COMPLETED
membutuhkan minimal satu AFTER evidence.

## Features

- Status action berdasarkan status aktif
- Confirmation dialog
- Optional status notes
- BEFORE evidence validation
- AFTER evidence validation
- Loading state
- Error state
- Automatic detail refresh
- Updated status badge
- Updated status timeline
- Completed read-only state

## Security

Validasi client hanya digunakan untuk UX.

Backend tetap menjadi sumber kebenaran
untuk status transition dan evidence requirement.

## Verification

- ASSIGNED → ON_THE_WAY berhasil
- Notes tersimpan di status history
- ON_THE_WAY tanpa BEFORE tidak dapat dilanjutkan
- ON_THE_WAY dengan BEFORE → IN_PROGRESS berhasil
- IN_PROGRESS tanpa AFTER tidak dapat diselesaikan
- IN_PROGRESS dengan AFTER → COMPLETED berhasil
- completedAt berhasil tersimpan
- COMPLETED menjadi read-only
- Status badge diperbarui
- Status history diperbarui
- Invalid transition tetap ditolak backend
- Authentication tetap berjalan
- Auto refresh token tetap berjalan
- TypeScript berhasil
- Expo Doctor berhasil
- Backend typecheck berhasil
- Backend build berhasil
