## Summary

Menambahkan endpoint detail Work Order milik TECHNICIAN.

## Changes

- Menambahkan service `getTechnicianWorkOrderDetails`
- Menambahkan controller detail tugas teknisi
- Menambahkan endpoint `GET /api/work-orders/my/:workOrderId`
- Mengambil `technicianId` dari user yang sedang login
- Memastikan teknisi hanya dapat melihat Work Order miliknya
- Menampilkan informasi customer
- Menampilkan status history
- Menampilkan attachments
- Mengubah fileSize BigInt menjadi string
- Mengembalikan 404 untuk Work Order yang bukan milik teknisi
- Mencegah IDOR pada detail Work Order
- Memperbaiki nama `listWorkOrdersController`
- Menyamakan response menggunakan properti `success`
- Membersihkan unused import pada Work Order controller dan service

## Endpoint

`GET /api/work-orders/my/:workOrderId`

## Authorization

TECHNICIAN only.

Identitas teknisi diambil dari:

`request.auth.userId`

Client tidak dapat menentukan `technicianId`.

Query detail Work Order dibatasi menggunakan:

`id = workOrderId`

dan:

`technicianId = request.auth.userId`

Dengan demikian teknisi hanya dapat melihat Work Order yang memang ditugaskan kepadanya.

## Security

Endpoint menerapkan resource ownership authorization.

Work Order yang tidak ditemukan dan Work Order milik teknisi lain sama-sama menghasilkan:

`404 WORK_ORDER_NOT_FOUND`

Hal ini mencegah kebocoran informasi mengenai keberadaan Work Order milik teknisi lain.

## Verification

- Detail tugas teknisi berhasil: `200`
- UUID tidak valid: `422`
- Work Order tidak ditemukan: `404`
- Work Order milik teknisi lain: `404`
- Tanpa token: `401`
- Token ADMIN: `403`
- Customer berhasil dikembalikan
- Status histories berhasil dikembalikan
- Attachments berhasil dikembalikan
- fileSize berhasil diubah menjadi string
- Password hash tidak dikembalikan
- Endpoint daftar tugas teknisi tetap berjalan
- Endpoint Admin Work Order tetap berjalan
- Typecheck berhasil
- Build berhasil
- Regression test berhasil