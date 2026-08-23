# Mobile Technician Task List

## Summary

Menambahkan daftar Work Order milik technician
ke aplikasi mobile OpsMate.

## Endpoint

GET /api/work-orders/my

## Authentication

TECHNICIAN only.

Authentication menggunakan access token
yang dikelola oleh mobile authentication layer.

## Features

- Daftar Work Order technician
- Search berdasarkan nomor Work Order atau judul
- Filter berdasarkan status
- Pull to refresh
- Pagination
- Loading state
- Error state
- Empty state
- Work Order status badge
- Customer information
- Scheduled date information
- Customer address information

## Supported Filters

- ALL
- ASSIGNED
- ON_THE_WAY
- IN_PROGRESS
- COMPLETED

## Pagination

Default:

page=1
limit=10

Mobile melakukan load more ketika user
mendekati bagian bawah daftar.

## Verification

- Technician task list berhasil dimuat
- Access token digunakan otomatis
- Search bekerja
- Status filter bekerja
- Pull to refresh bekerja
- Empty state tampil
- Error state tampil
- Pagination bekerja
- Session refresh tetap bekerja
- ADMIN tidak dapat masuk area technician
- TypeScript berhasil
- Expo Doctor berhasil
