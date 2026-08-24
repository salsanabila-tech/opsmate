# Web Admin Foundation

## Architecture

OpsMate menggunakan dua client:

- Mobile application untuk TECHNICIAN
- Web dashboard untuk ADMIN

Keduanya menggunakan shared OpsMate REST API.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Lucide React

## Authentication

Web menggunakan:

POST /api/auth/login
POST /api/auth/refresh
GET /api/auth/me
POST /api/auth/logout

Web hanya menerima akun dengan role ADMIN.

## Routes

/login

/app

/app/work-orders

/app/customers

/app/technicians

## Features

- Admin login
- Role protection
- Protected routes
- Access token authentication
- Refresh token rotation
- Automatic 401 retry
- Session restoration
- Admin sidebar
- Logout
- Responsive foundation

## Security Note

Token storage menggunakan sessionStorage
untuk development foundation.

Production hardening akan memindahkan
web refresh token ke HttpOnly secure cookie.

## Verification

- ADMIN login berhasil
- TECHNICIAN ditolak
- Protected route berhasil
- Refresh page mempertahankan session
- Automatic token refresh berhasil
- Logout berhasil
- Sidebar navigation berhasil
- npm run lint berhasil
- npm run build berhasil
