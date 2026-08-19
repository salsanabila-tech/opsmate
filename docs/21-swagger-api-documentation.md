## Swagger API Documentation

Dokumentasi API OpsMate kini tersedia melalui Swagger UI.

## Menjalankan Backend

```bash
cd backend
npm run dev
```

Buka [http://localhost:3000/api-docs](http://localhost:3000/api-docs) untuk melihat seluruh endpoint dan mencoba request langsung dari browser.

Spesifikasi OpenAPI dalam format JSON tersedia pada [http://localhost:3000/api-docs/openapi.json](http://localhost:3000/api-docs/openapi.json). Endpoint ini dapat dipakai untuk mengimpor koleksi ke Postman atau alat lain yang mendukung OpenAPI.

## Mencoba Endpoint yang Dilindungi

1. Jalankan `POST /auth/login` dengan akun ADMIN.
2. Salin nilai `data.accessToken` dari respons.
3. Klik tombol **Authorize** di kanan atas Swagger UI.
4. Isi dengan `Bearer <accessToken>`, kemudian klik **Authorize**.
5. Endpoint ADMIN seperti `/customers`, `/work-orders`, dan `/users/technicians` dapat dicoba menggunakan tombol **Try it out**.

Access token akan disimpan oleh Swagger UI di browser selama halaman tersebut digunakan. Refresh token tidak perlu dimasukkan ke tombol **Authorize**; token itu hanya dipakai pada `POST /auth/refresh`.

## Memperbarui Dokumentasi

Definisi OpenAPI disimpan di `backend/src/docs/openapi.ts`. Setiap kali route, parameter, request body, atau respons API berubah, perbarui file tersebut agar dokumentasi Swagger tetap sesuai dengan implementasi.
