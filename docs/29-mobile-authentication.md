# Mobile Authentication

## Summary

Menambahkan authentication flow pada aplikasi mobile OpsMate.

## Features

- Login ADMIN
- Login TECHNICIAN
- Secure token storage
- Session restoration
- Automatic access token refresh
- Refresh token rotation support
- Role based routing
- Protected ADMIN routes
- Protected TECHNICIAN routes
- Logout

## Storage

Token disimpan menggunakan Expo SecureStore.

Stored values:

- access token
- refresh token

## Routes

POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me
POST /api/auth/logout

## Mobile Flow

Unauthenticated
→ Login

ADMIN
→ Admin Area

TECHNICIAN
→ Technician Area

## Verification

- ADMIN login berhasil
- TECHNICIAN login berhasil
- Invalid credentials ditolak
- Session tetap tersedia setelah restart aplikasi
- Expired access token berhasil direfresh
- Logout berhasil
- Role protection berhasil
- TypeScript berhasil
- Expo Doctor berhasil
