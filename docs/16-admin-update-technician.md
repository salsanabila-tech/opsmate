# Admin memperbarui data teknisi

## Endpoint

PATCH /api/users/technicians/:technicianId

## Hak akses

hanya role ADMIN.

## Field yang dapat berubah

- name
- email
- phone

## Field yang tidak dapat berubah

- role
- password
- passwordHash
- isActive

## Partial update

Endpoint menggunakan PATCH sehingga client hanya perlu mengirim field yang ingin diperbarui.

Minimal satu field harus di kirim.

## Email

Email harus unik.

Email milik teknisi sendiri tetap dapat digunakan.

Email milik user lain menghasilkan 409.

## Phone

Phone dapat dikirim sebagai null untuk menghapus nomor telepon.

## Session

Perubahan nama, email, atau phone tidak mencabut session teknisi.

## Error

- 401 jika tidak terautentikasi
- 403 jika bukan ADMIN
- 404 jika teknisi tidak ditemukan
- 409 jika email sudah digunakan
- 422 jika parameter atau body tidak valid
