# Admin Mengelola Status Teknisi

## Endpoint

PATCH /api/users/technicians/:technicianId/status

## Hak Akses

Endpoint hanya dapat digunakan oleh role ADMIN

## Request Body

{
"isActive: false
}

## Penonaktifan Teknisi

Saat teknisi dinonaktifkan:

1. Status isActive diubah menjadi false
2. Seluruh session teknisi dicabut.
3. Access token lama ditolak.
4. Refresh token lama ditolak.
5. Teknisi tidak dapat login.

## Aktivasi Teknisi

Saat teknisi diaktifkan:

1. Status isActive diubah menjadi true
2. Session lama tetap dicabut
3. Teknisi harus login kembali
4. Login baru menghasilkan session baru.

## Transaction

Pembaruan status dan pecabutan session dijalankan dalam satu database transaction.

## Error

- 401 jika tidak terautentikasi
- 403 jika role bukan admin
- 404 jika teknisi tidak di temukan
- 422 jika parameter atau body tidak valid
