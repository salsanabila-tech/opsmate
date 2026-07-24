# Role Authorization dan Pembuatan Teknisi

## Authentikasi dan Authorization

Authentication memastikan identitas pengguna.

Authorization menentukan tindakan yang diizinkan berdasarkan role pengguna.

## Endpoint

POST /api/users/technicians

## Akses

Endpoint hanya dapat digunakan oleh role ADMIN.

## Proses

1. Access token diverifikasi.
2. Session pengguna diperiksa.
3. Role pengguna diperiksa.
4. Request body divalidasi.
5. Password diubah menjadi hash Argon2.
6. Akun dibuat dengan role TECHNICIAN.
7. Password hash tidak dikirim pada response.

## Error

- 401 jika tidak terautentikasi
- 403 jika role bukan ADMIN
- 409 jika email sudah digunakan
- 422 jika body tidak valid