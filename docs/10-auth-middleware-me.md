# Authentication Middleware dan Current User

## Endpoint

GET /api/auth/me

## Authorization

Endpoint menggunakan header:

Authorization: Bearer ACCESS_TOKEN

## Proses Middleware

1. Membaca Authorization header.
2. Memastikan format bearer token valid.
3. Memverifikasi access token.
4. Memeriksa token type.
5. Memeriksa session di database.
6. Memeriksa status session.
7. Memeriksa status user.
8. Menyimpan identitas authentication pada request.

## Current User

Endpoint `/api/auth/me` mengembalikan profil pengguna yang sedang terautentikasi.

Password hash dan informasi session tidak dikirimkan.
