# Logout Authentication

## Endpoint

POST /api/auth/logout

## Authorization

Endpoint membutuhkan access token melalui header:

Authorization: Bearer ACCESS_TOKEN

## Proses

1. Access token diverifikasi.
2. Session diperiksa melalui database.
3. User ID dan session ID diambil dari request.auth.
4. Session diperbarui dengan mengisi revoked_at.
5. Access token dari session tersebut ditolak.
6. Refresh token dari session tersebut juga akan ditolak.

## Perilaku Multi-Device

Logout hannya mencabut session yang digunakan pada request.

Session lain milik pengguna yang sama tetap aktif.

## Error

- 401 jika access token tidak tersedia.
- 401 jika access token tidak valid.
- 401 jika session sudah dicabut.
- 402 jika session sudah kedaluwarsa.