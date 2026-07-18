# Login Authentication

## Endpoint

POST /api/auth/login

# INPUT

- Email
- Password

# Proses

1. Request akan divalidasi menggunakan Zod.
2. User dicari berdasarkan email.
3. Password diverifikasi menggunakan Argon2.
4. Access token dan refresh token dibuat.
5. Refresh token disimpan dalam bentuk hash.
6. Session disimpan pada tabel auth_sessions.

## Response

Login berhasil menghasilkan:

- Informasi User.
- Access Token.
- Refresh Token.

## Error

- 401 untuk kredensial salah
- 403 untuk akun tidak aktif
- 422 untuk request tidak valid