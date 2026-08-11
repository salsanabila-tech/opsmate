# Admin Membuat Customer


## Endpoint 

POST /api/customers

## Hak Akses

Endpoint hanya dapat digunakan oleh ADMIN.

## Field

Required:

- name
- phone
- address

Optional:

- email
- notes

## Authentication

Request harus menggunakan access token ADMIN.

## Customer dan User

Customer bukan user aplikasi

Customer tidak mempunya:

- password
- role
- auth session

Customer digunakan sebagai pihak yang terkait denga Work Order.

## Response

Customer berhasil dibuat dan menghasilkan 201.

## Error

- 401 Jika tidak terautentikasi
- 403 Jika bukan ADMIN
- 422 Jika request tidak valid