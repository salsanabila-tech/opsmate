# Database Runtime dan Seed

## Prisma Client

Prisma Client digunakan oleh backend untuk menjalankan query
ke PostgreSQL.

Instance Prisma dibuat satu kali pada:

`backend/src/lib/prisma.ts`

## Database Health Check

Endpoint:

`GET /api/health/database`

digunakan untuk memeriksa apakah backend dapat terhubung
dan menjalankan query ke PostgreSQL.

## Seed

Seed digunakan untuk memasukkan data awal ke database.

Admin awal dibuat menggunakan:

`npm run prisma:seed`

Password tidak disimpan dalam bentuk plaintext.
Password disimpan dalam bentuk hash Argon2.

## Upsert

Upsert akan memperbarui data jika email sudah ada
dan membuat data apabila email belum tersedia.