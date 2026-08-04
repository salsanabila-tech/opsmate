# Admin Melihat Detail Teknisi

## Endpoint

GET /api/users/technicians/:technicianId

## Hak Akses

Endpoint hanya dapat digunakan oleh role Admin.

## Parameter

technicianId harus berupa UUID yang valid.

## Proses

1. Access token diverifikasi.
2. Role pengguna diperiksa.
3. Technician ID divalidasi.
4. User dicari berdasarkan ID dan role TECHNICIAN.
5. Detail teknisi dikembalikan.
6. Jumlah work order yang ditugaskan ikut dihitung.
7. Password hash dan session tidak dikirim.

## Error

- 401 jika tidak terautentikasi
- 403 jika role bukan ADMIN
- 404 jika teknisi tidak ditemukan
- 422 jika technicianId bukan UUID yang valid
