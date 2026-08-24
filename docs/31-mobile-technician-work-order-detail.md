# Mobile Technician Work Order Detail

## Summary

Menambahkan halaman detail Work Order untuk Technician
pada aplikasi mobile OpsMate.

## Endpoint

GET /api/work-orders/my/:workOrderId

## Features

- Work Order number
- Work Order status
- Title and description
- Scheduled date
- Completed date
- Customer information
- Customer notes
- Status history timeline
- BEFORE evidence
- AFTER evidence
- OTHER attachments
- Evidence image preview
- Pull to refresh
- Loading state
- Error state
- Back navigation

## Security

Technician hanya dapat membuka Work Order miliknya.

Work Order milik technician lain menghasilkan 404.

## Verification

- Task card dapat ditekan
- Detail route berhasil dibuka
- Work Order data tampil
- Customer data tampil
- Status history tampil
- Evidence tampil
- Relative attachment URL berhasil diubah menjadi absolute URL
- Empty evidence state tampil
- Pull to refresh bekerja
- Back navigation bekerja
- Ownership protection tetap bekerja
- TypeScript berhasil
- Expo Doctor berhasil
