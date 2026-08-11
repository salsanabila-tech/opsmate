# Admin Melihat Customer

## Endpoint

GET /api/customers
GET /api/customers/:customerId

## Hak Akses

Hanya ADMIN.

## Daftar Customer

Mendukung:

- pagination
- search name
- search phone
- search email

## Query

- page
- limit
- search

## Detail Customer

customerId harus berupa UUID valid.

## Error

- 401 jika tidak terautentikasi
- 403 jika bukan ADMIN
- 404 jika customer tidak ditemukan
- 422 jika query atau customerId tidak valid
