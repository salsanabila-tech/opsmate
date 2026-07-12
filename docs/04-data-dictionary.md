## 1. Tabel users
|      KOLOM     | TIPE DATA     | NULL  |   KEY   |         KETERANGAN          |
|id              |  UUID         | Tidak |   PK    | ID pengguna                 |
|name            | VARCHAR(100)  | Tidak |         | Nama pengguna               |
|email           | VARCHAR(150)  | Tidak | UNIQUE  | Email login                 |
|password_hash   | VARCHAR(255)  | Tidak |         | Password yang sudah di-hash |
|phone           | VARCHAR(20)   |  Ya   |         | Nomor telepon               |
|role            | VARCHAR(20)   | Tidak |         | ADMIN atau TECHNICIAN       |
|is_active       | BOOLEAN       | Tidak |         | Status akun                 |
|created_at      | TIMESTAMP     | Tidak |         | Waktu data dibuat           |
|updated_at      | TIMESTAMP     | Tidak |         | Waktu data diperbarui       |


## 2. Tabel customers
|      KOLOM     | TIPE DATA     | NULL  |   KEY   |          KETERANGAN     |
|id              |   UUID        | Tidak |   PK    | ID pelanggan            |
|name            | VARCHAR(100)  | Tidak |         | Nama pelanggan          |
|phone           | vARCHAR(20)   | Tidak |         | Nomor Telepon           |
|email           | VARCHAR(150)  |  Ya   |         | Email pelanggan         |
|address         | TEXT          | Tidak |         | Alamat pelanggan        |
|notes           | TEXT          |  Ya   |         | Catatan tambahan        |
|created_at      | TIMESTAMP     | Tidak |         | Waktu data dibuat       |
|updated_at      | TIMESTAMP     | Tidak |         | Waktu data diperbarui   |


## 3. Tabel work_orders
|      KOLOM        | TIPE DATA     | NULL  |   KEY   |      DEFAULT      |                    KETERANGAN                    |
|id                 |    UUID       | Tidak |   PK    | gen_random_uuid() | ID unik work order                               |
|work_order_number  | VARCHAR(30)   | Tidak | UNIQUE  |                   | Nomor work order yang mudah dibaca pengguna      |
|customer_id        |    UUID       | Tidak |   FK    |                   | ID pelanggan yang memiliki pekerjaan             |
|technician_id      |    UUID       |  Ya   |   FK    | NULL              | ID teknisi yang ditugaskan                       |
|title              | VARCHAR(150)  | Tidak |         |                   | Judul singkat pekerjaan                          |
|description        |    TEXT       | Tidak |         |                   | Penjelasan kerusakan atau permintaan pelanggan   |
|schedule_at        |  TIMESTAMP    | Tidak |         |                   | Tanggal dan waktu pekerjaan dijadwalkan          |
|status             | VARCHAR(30)   | Tidak |         | PENDING           | Status pekerjaan saat ini                        |
|completed_at       |  TIMESTAMP    |  Ya   |         | NULL              | Waktu pekerjaan selesai                          |
|created_by         |    UUID       | Tidak |   FK    |                   | ID Admin yang membuat work order                 |
|created_at         |  TIMESTAMP    | Tidak |         | CURRENT_TIMESTAMP | Waktu data dibuat                                |
|updated_at         |  TIMESTAMP    | Tidak |         | CURRENT_TIMESTAMP | Waktu terakhir data diperbarui                   |


## 4. Tabel work_order_histories
|      KOLOM        | TIPE DATA     | NULL  |   KEY   |      DEFAULT      |             KETERANGAN                    |
|id                 |    UUID       | Tidak |   PK    | gen_random_uuid() | ID unik histori status                    |   
|work_order_id      |    UUID       | Tidak |   FK    |                   | Work order yang statusnya berubah         |
|previous_status    | VARCHAR(30)   |  Ya   |         |       NULL        | Status sebelum perubahan                  |
|new_status         | VARCHAR(30)   | Tidak |         |                   | Status setelah perubahan                  |
|changed_by         |    UUID       | Tidak |   FK    |                   | Pengguna yang mengubah status             |
|notes              |    TEXT       |  Ya   |         |       NULL        | Alasan atau informasi perubahan status    |
|created_at         | TIMESTAMP     | Tidak |         | CURRENT_TIMESTAMP | Waktu perubahan status dilakukan          |


## 5. Tabel work_order_attachments
|      KOLOM        |  TIPE DATA     | NULL  |   KEY   |      DEFAULT      |             KETERANGAN                    |
|id                 |  UUID          | Tidak |   PK    | gen_random_uuid() | ID unik attachment                        |
|work_order_id      |  UUID          | Tidak |   FK    |                   | Work oder pemilik file                    |
|uploaded_by        |  UUID          | Tidak |   FK    |                   | Pengguna yang mengunggah file             |
|file_url           |  TEXT          | Tidak |         |                   | Lokasi file pada layanan penyimpanan      |
|file_name          | VARCHAR(255)   | Tidak |         |                   | Nama asli atau nama file yang disimpan    |
|file_type          | VARCHAR(100)   | Tidak |         |                   | Jenis file yang diunggah                  |
|file_size          |  BIGINT        | Tidak |         |                   | Ukuran file dalam byte                    |
|attachment_type    | VARCHAR(30)    | Tidak |         |                   | Kategori attachment                       |
|description        |  TEXT          |  Ya   |         |                   | Penjelasan mengenai file                  |
|created_at         | TIMESTAMP      | Tidak |         |                   | Waktu file diunggah                       |