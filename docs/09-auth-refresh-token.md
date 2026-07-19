# Refresh Token Rotation

## Endpoint

POST /api/auth/refresh

## Tujuan

Endpoint refresh digunakan untuk memperoleh access token baru tanpa meminta pengguna login ulang.

## Proses

1. Request body di validasi.
2. Signature refresh token di verifikasi.
3. Payload token di periksa.
4. Session dicari berdasarkan session ID.
5. Hash token dibandingkan dengan hash pada database.
6. Status session dan user diperiksa.
7. Access token baru dibuat.
8. Refresh token baru dibuat.
9. Hash refresh token pada session di perbarui.
10. Refresh token lama tidak dapat digunakan kembali.

## Error

- 401 Jika token tidak valid
- 401 Jika token sudah digunakan
- 401 Jika session dicabut
- 401 Jika session kedaluwarsa
- 403 Jika akun tidak aktif
- 422 Jika request body tidak valid

