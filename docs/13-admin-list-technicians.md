# Admin melihat daftar teknisi

## Endpoint

GET /api/users/technicians

## Hak akses

Endpoint hanya dapat digunakan oleh role ADMIN.

## Query parameters

- page
- limit
- search
- status

## Proses

1. access token diverifikasi
2. role pengguna diperiksa
3. query parameter divalidasi
4. data difilter berdasarkan role TECHNICIAN
5. pencarian dilakukan pada nama dan email
6. data dipaginasi menggunakan skip dan take
7. total data dihitung
8. password hash tidak dikirim pada response

## Error

- 401 jika tidak terautentikasi
- 403 jika role bukan ADMIN
- 422 jika query tidak valid