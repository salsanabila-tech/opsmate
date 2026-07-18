# Authentication Design OpsMate

## Pengguna

- Admin
- Technician

## Pembuatan Akun

Admin pertama kali dibuat melalui database seed.

Akun teknisi dibuat oleh admin melalui endpoint terproteksi. 
Tidak tersedia registrasi public.

## Login

Pengguna login menggunakan email dan password.

Jika kredensial benar, backend menghasilkan:

- Access token
- Refresh token
- Informasi Pengguna

## Access Token

Akses token digunakan untuk mengakses endpoint terproteksi.

Akses token memiliki masa berlangku singkat.

## Refresh Token

Refresh token digunakan untuk mendapatkan access token baru.

Refresh token memiliki masa berlaku lebih panjang dan sesi disimpan di database.

## Logout

Logout mencabut sesi refresh token pada database.

## Authorization

Role ADMIN memiliki akses pengelolaan pengguna.

Role TECHNICIAN hanya dapat mengakses pekerjaan yang ditugaskan kepadanya.
