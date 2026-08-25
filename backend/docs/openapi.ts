const uuidExample = '550e8400-e29b-41d4-a716-446655440000';
const isoDateExample = '2027-08-20T09:00:00.000Z';

const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'OpsMate API',
    version: '1.0.0',
    description:
      'Dokumentasi interaktif API OpsMate. Login sebagai ADMIN atau TECHNICIAN, salin `accessToken`, lalu klik **Authorize** dan isi dengan format `Bearer <accessToken>` untuk mencoba endpoint yang sesuai dengan peran pengguna.',
  },
  servers: [
    {
      url: '/api',
      description: 'API server saat ini',
    },
  ],
  tags: [
    { name: 'Health', description: 'Status layanan dan koneksi database.' },
    { name: 'Authentication', description: 'Login, refresh token, dan sesi pengguna.' },
    { name: 'Customers', description: 'Manajemen customer. Hanya ADMIN.' },
    { name: 'Work Orders', description: 'Manajemen work order. Hanya ADMIN.' },
    { name: 'Technician Work Orders', description: 'Daftar tugas, detail, status, dan evidence work order milik TECHNICIAN.' },
    { name: 'Technicians', description: 'Manajemen akun teknisi. Hanya ADMIN.' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Cek status API',
        responses: {
          '200': {
            description: 'API berjalan.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/health/database': {
      get: {
        tags: ['Health'],
        summary: 'Cek koneksi database',
        responses: {
          '200': {
            description: 'Database dapat diakses.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/DatabaseHealthResponse' } } },
          },
          '503': { $ref: '#/components/responses/DatabaseUnavailable' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: { email: 'admin@opsmate.test', password: 'password-admin' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login berhasil.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } },
          },
          '401': { $ref: '#/components/responses/InvalidCredentials' },
          '403': { $ref: '#/components/responses/AccountInactive' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Perbarui access token',
        description: 'Refresh token hanya dapat digunakan sekali; respons mengembalikan pasangan token baru.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
              example: { refreshToken: 'refresh-token-dari-login' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token berhasil diperbarui.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AccountInactive' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Ambil profil pengguna aktif',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Profil pengguna.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CurrentUserResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout dari sesi saat ini',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Sesi berhasil dicabut.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/customers': {
      get: {
        tags: ['Customers'],
        summary: 'Daftar customer',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'search',
            in: 'query',
            description: 'Cari berdasarkan nama, telepon, atau email.',
            schema: { type: 'string', maxLength: 100 },
          },
        ],
        responses: {
          '200': {
            description: 'Daftar customer.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerListResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '422': { $ref: '#/components/responses/ValidationQueryError' },
        },
      },
      post: {
        tags: ['Customers'],
        summary: 'Buat customer',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCustomerRequest' },
              example: {
                name: 'Budi Santoso',
                phone: '081234567890',
                email: 'budi@example.com',
                address: 'Jl. Merdeka No. 10, Jakarta',
                notes: 'Hubungi sebelum datang.',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Customer dibuat.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/customers/{customerId}': {
      get: {
        tags: ['Customers'],
        summary: 'Detail customer',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/CustomerId' }],
        responses: {
          '200': {
            description: 'Detail customer.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CustomerResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '404': { $ref: '#/components/responses/CustomerNotFound' },
          '422': { $ref: '#/components/responses/ValidationParameterError' },
        },
      },
    },
    '/work-orders': {
      get: {
        tags: ['Work Orders'],
        summary: 'Daftar work order',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'search',
            in: 'query',
            description: 'Cari berdasarkan nomor work order atau judul.',
            schema: { type: 'string', minLength: 1, maxLength: 100 },
          },
          {
            name: 'status',
            in: 'query',
            schema: { $ref: '#/components/schemas/WorkOrderStatus' },
          },
          {
            name: 'technicianId',
            in: 'query',
            description: 'UUID teknisi yang ditugaskan.',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'customerId',
            in: 'query',
            description: 'UUID customer.',
            schema: { type: 'string', format: 'uuid' },
          },
          {
            name: 'fromDate',
            in: 'query',
            description: 'Batas awal scheduledAt (ISO 8601). Harus kurang dari atau sama dengan toDate.',
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'toDate',
            in: 'query',
            description: 'Batas akhir scheduledAt (ISO 8601).',
            schema: { type: 'string', format: 'date-time' },
          },
        ],
        responses: {
          '200': {
            description: 'Daftar work order.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkOrderListResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '422': { $ref: '#/components/responses/ValidationQueryError' },
        },
      },
      post: {
        tags: ['Work Orders'],
        summary: 'Buat work order',
        description: 'Hanya dapat diakses oleh ADMIN. Status awal menjadi `ASSIGNED` saat `technicianId` diisi, atau `PENDING` bila tidak.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateWorkOrderRequest' },
              example: {
                customerId: uuidExample,
                technicianId: '4de3a4f8-1330-4f93-a4ef-6bb8dd5a72a9',
                title: 'Perbaikan AC kantor',
                description: 'AC lantai dua tidak dingin sejak pagi.',
                scheduledAt: isoDateExample,
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Work order dibuat.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkOrderResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '404': { $ref: '#/components/responses/CustomerOrTechnicianNotFound' },
          '409': { $ref: '#/components/responses/TechnicianInactive' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/work-orders/my': {
      get: {
        tags: ['Technician Work Orders'],
        summary: 'Daftar tugas teknisi aktif',
        description:
          'Hanya dapat diakses oleh TECHNICIAN. Identitas teknisi diambil dari access token sehingga respons hanya berisi work order yang ditugaskan kepadanya.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'search',
            in: 'query',
            description: 'Cari berdasarkan nomor work order atau judul.',
            schema: { type: 'string', minLength: 1, maxLength: 100 },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filter status work order.',
            schema: { $ref: '#/components/schemas/WorkOrderStatus' },
          },
          {
            name: 'fromDate',
            in: 'query',
            description: 'Batas awal scheduledAt (ISO 8601). Harus kurang dari atau sama dengan toDate.',
            schema: { type: 'string', format: 'date-time' },
          },
          {
            name: 'toDate',
            in: 'query',
            description: 'Batas akhir scheduledAt (ISO 8601).',
            schema: { type: 'string', format: 'date-time' },
          },
        ],
        responses: {
          '200': {
            description: 'Daftar work order milik teknisi aktif.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianWorkOrderListResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/TechnicianOnly' },
          '422': { $ref: '#/components/responses/ValidationQueryError' },
        },
      },
    },
    '/work-orders/my/{workOrderId}': {
      get: {
        tags: ['Technician Work Orders'],
        summary: 'Detail tugas teknisi',
        description:
          'Hanya dapat diakses oleh TECHNICIAN yang ditugaskan pada work order tersebut. Work order yang tidak ada atau bukan milik teknisi aktif sama-sama menghasilkan 404.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/WorkOrderId' }],
        responses: {
          '200': {
            description: 'Detail tugas beserta customer, riwayat status, dan attachment.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianWorkOrderDetailResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/TechnicianOnly' },
          '404': { $ref: '#/components/responses/WorkOrderNotFound' },
          '422': { $ref: '#/components/responses/ValidationParameterError' },
        },
      },
    },
    '/work-orders/my/{workOrderId}/status': {
      patch: {
        tags: ['Technician Work Orders'],
        summary: 'Perbarui status tugas teknisi',
        description:
          'Hanya dapat diakses oleh TECHNICIAN pemilik tugas. Urutan yang diizinkan adalah `ASSIGNED` → `ON_THE_WAY` → `IN_PROGRESS` → `COMPLETED`. Minimal satu evidence `BEFORE` wajib tersedia sebelum masuk ke `IN_PROGRESS`, dan evidence `AFTER` sebelum masuk ke `COMPLETED`.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/WorkOrderId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTechnicianWorkOrderStatusRequest' },
              example: {
                status: 'ON_THE_WAY',
                notes: 'Teknisi sedang menuju lokasi customer.',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status work order berhasil diperbarui.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianWorkOrderStatusResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/TechnicianOnly' },
          '404': { $ref: '#/components/responses/WorkOrderNotFound' },
          '409': { $ref: '#/components/responses/WorkOrderStatusConflict' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/work-orders/my/{workOrderId}/attachments': {
      post: {
        tags: ['Technician Work Orders'],
        summary: 'Unggah attachment atau evidence tugas',
        description:
          'Hanya dapat diakses oleh TECHNICIAN pemilik tugas. File harus JPEG, PNG, atau WEBP dengan ukuran maksimal 5 MB. `BEFORE` hanya boleh saat status `ON_THE_WAY`, `AFTER` hanya saat `IN_PROGRESS`, sedangkan `OTHER` boleh saat `ASSIGNED`, `ON_THE_WAY`, atau `IN_PROGRESS`.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/WorkOrderId' }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/CreateWorkOrderAttachmentRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Attachment berhasil diunggah.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkOrderAttachmentResponse' } } },
          },
          '400': { $ref: '#/components/responses/InvalidFileUpload' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/TechnicianOnly' },
          '404': { $ref: '#/components/responses/WorkOrderNotFound' },
          '409': { $ref: '#/components/responses/AttachmentUploadConflict' },
          '413': { $ref: '#/components/responses/AttachmentTooLarge' },
          '415': { $ref: '#/components/responses/UnsupportedAttachmentType' },
          '422': { $ref: '#/components/responses/AttachmentValidationError' },
        },
      },
    },
    '/work-orders/{workOrderId}': {
      get: {
        tags: ['Work Orders'],
        summary: 'Detail work order',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/WorkOrderId' }],
        responses: {
          '200': {
            description: 'Detail work order beserta customer, teknisi, pembuat, riwayat status, dan attachment.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/WorkOrderDetailResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '404': { $ref: '#/components/responses/WorkOrderNotFound' },
          '422': { $ref: '#/components/responses/ValidationParameterError' },
        },
      },
    },
    '/users/technicians': {
      get: {
        tags: ['Technicians'],
        summary: 'Daftar teknisi',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { $ref: '#/components/parameters/Limit' },
          {
            name: 'search',
            in: 'query',
            description: 'Cari berdasarkan nama atau email.',
            schema: { type: 'string', maxLength: 100 },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filter status akun.',
            schema: { type: 'string', enum: ['all', 'active', 'inactive'], default: 'all' },
          },
        ],
        responses: {
          '200': {
            description: 'Daftar teknisi.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianListResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '422': { $ref: '#/components/responses/ValidationQueryError' },
        },
      },
      post: {
        tags: ['Technicians'],
        summary: 'Buat akun teknisi',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTechnicianRequest' },
              example: {
                name: 'Siti Aminah',
                email: 'siti@opsmate.test',
                phone: '081298765432',
                password: 'password-teknisi',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Teknisi dibuat.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '409': { $ref: '#/components/responses/EmailAlreadyExists' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/users/technicians/{technicianId}': {
      get: {
        tags: ['Technicians'],
        summary: 'Detail teknisi',
        description: 'Hanya dapat diakses oleh ADMIN.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/TechnicianId' }],
        responses: {
          '200': {
            description: 'Detail teknisi.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianDetailResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '404': { $ref: '#/components/responses/TechnicianNotFound' },
          '422': { $ref: '#/components/responses/ValidationParameterError' },
        },
      },
      patch: {
        tags: ['Technicians'],
        summary: 'Perbarui detail teknisi',
        description: 'Hanya dapat diakses oleh ADMIN. Kirim minimal satu properti.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/TechnicianId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTechnicianRequest' },
              example: { name: 'Siti Aminah Putri', phone: '081200000000' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Teknisi diperbarui.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '404': { $ref: '#/components/responses/TechnicianNotFound' },
          '409': { $ref: '#/components/responses/EmailAlreadyExists' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/users/technicians/{technicianId}/status': {
      patch: {
        tags: ['Technicians'],
        summary: 'Aktifkan atau nonaktifkan teknisi',
        description: 'Hanya dapat diakses oleh ADMIN. Menonaktifkan teknisi juga mencabut semua sesi aktifnya.',
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/TechnicianId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTechnicianStatusRequest' },
              example: { isActive: false },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status teknisi diperbarui.',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/TechnicianStatusResponse' } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/AdminOnly' },
          '404': { $ref: '#/components/responses/TechnicianNotFound' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan access token dari endpoint login.',
      },
    },
    parameters: {
      Page: {
        name: 'page',
        in: 'query',
        description: 'Nomor halaman, dimulai dari 1.',
        schema: { type: 'integer', minimum: 1, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        description: 'Jumlah data per halaman.',
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
      CustomerId: {
        name: 'customerId',
        in: 'path',
        required: true,
        description: 'UUID customer.',
        schema: { type: 'string', format: 'uuid', example: uuidExample },
      },
      TechnicianId: {
        name: 'technicianId',
        in: 'path',
        required: true,
        description: 'UUID teknisi.',
        schema: { type: 'string', format: 'uuid', example: uuidExample },
      },
      WorkOrderId: {
        name: 'workOrderId',
        in: 'path',
        required: true,
        description: 'UUID work order.',
        schema: { type: 'string', format: 'uuid', example: uuidExample },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Access token tidak ada, tidak valid, kedaluwarsa, atau sesi telah dicabut.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      AdminOnly: {
        description: 'Akun tidak memiliki peran ADMIN.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      TechnicianOnly: {
        description: 'Akun tidak memiliki peran TECHNICIAN.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      ValidationError: {
        description: 'Body request tidak memenuhi validasi.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } },
      },
      ValidationQueryError: {
        description: 'Query parameter tidak memenuhi validasi.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } },
      },
      ValidationParameterError: {
        description: 'Path parameter tidak memenuhi validasi.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationErrorResponse' } } },
      },
      InvalidCredentials: {
        description: 'Email atau password salah.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      AccountInactive: {
        description: 'Akun tidak aktif.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      CustomerNotFound: {
        description: 'Customer tidak ditemukan.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      CustomerOrTechnicianNotFound: {
        description: 'Customer atau teknisi tidak ditemukan.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      TechnicianNotFound: {
        description: 'Teknisi tidak ditemukan.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      TechnicianInactive: {
        description: 'Teknisi yang dipilih tidak aktif.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      WorkOrderNotFound: {
        description: 'Work order tidak ditemukan atau bukan milik teknisi aktif.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      WorkOrderStatusConflict: {
        description:
          'Transisi status tidak diizinkan, status telah berubah, atau evidence wajib belum tersedia. Kode yang mungkin: `INVALID_STATUS_TRANSITION`, `WORK_ORDER_STATUS_CHANGED`, `BEFORE_EVIDANCE_REQUIRED`, atau `AFTER_EVIDENCE_REQUIRED`.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      AttachmentUploadConflict: {
        description:
          'Jenis attachment tidak boleh diunggah pada status work order saat ini. Kode yang mungkin: `BEFORE_EVIDENCE_NOT_ALLOWED`, `AFTER_EVIDENCE_NOT_ALLOWED`, atau `ATTACHMENT_UPLOAD_NOT_ALLOWED`.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      InvalidFileUpload: {
        description: 'Data upload multipart tidak valid.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      AttachmentTooLarge: {
        description: 'Ukuran file attachment melebihi batas 5 MB.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      UnsupportedAttachmentType: {
        description: 'MIME type atau isi file bukan JPEG, PNG, atau WEBP yang valid.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      AttachmentValidationError: {
        description: 'Parameter/body tidak valid atau field file tidak disertakan.',
        content: {
          'application/json': {
            schema: {
              oneOf: [{ $ref: '#/components/schemas/ValidationErrorResponse' }, { $ref: '#/components/schemas/ErrorResponse' }],
            },
          },
        },
      },
      EmailAlreadyExists: {
        description: 'Email telah digunakan oleh pengguna lain.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
      DatabaseUnavailable: {
        description: 'Koneksi database sedang tidak tersedia.',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/DatabaseUnavailableResponse' } } },
      },
    },
    schemas: {
      HealthResponse: {
        type: 'object',
        required: ['success', 'message', 'timestamp'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'OpsMate API is running' },
          timestamp: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      DatabaseHealthResponse: {
        type: 'object',
        required: ['success', 'message', 'responseTimeMs', 'timestamp'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Database connection is healthy' },
          responseTimeMs: { type: 'integer', example: 12 },
          timestamp: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      DatabaseUnavailableResponse: {
        type: 'object',
        required: ['success', 'message', 'timestamp'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Database connection is unavailable' },
          timestamp: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['success', 'message', 'code'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Authentication diperlukan' },
          code: { type: 'string', example: 'AUTHENTICATION_REQUIRED' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        required: ['success', 'message', 'code', 'errors'],
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Validasi data gagal' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              required: ['field', 'message'],
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Format email tidak valid' },
              },
            },
          },
        },
      },
      MessageResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Logout Berhasil' },
        },
      },
      UserRole: {
        type: 'string',
        enum: ['ADMIN', 'TECHNICIAN'],
      },
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Admin OpsMate' },
          email: { type: 'string', format: 'email', example: 'admin@opsmate.test' },
          phone: { type: 'string', nullable: true, example: '081234567890' },
          role: { $ref: '#/components/schemas/UserRole' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      LoginRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1, maxLength: 128, format: 'password' },
        },
      },
      LoginResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login Berhasil' },
          data: {
            type: 'object',
            required: ['user', 'accessToken', 'refreshToken'],
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            },
          },
        },
      },
      RefreshTokenRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string', minLength: 1 } },
      },
      RefreshTokenResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Token berhasil diperbarui' },
          data: {
            type: 'object',
            required: ['accessToken', 'refreshToken'],
            properties: {
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
              refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
            },
          },
        },
      },
      CurrentUserResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Profil pengguna berhasil diambil' },
          data: {
            type: 'object',
            required: ['user'],
            properties: { user: { $ref: '#/components/schemas/User' } },
          },
        },
      },
      Customer: {
        type: 'object',
        required: ['id', 'name', 'phone', 'email', 'address', 'notes', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Budi Santoso' },
          phone: { type: 'string', example: '081234567890' },
          email: { type: 'string', format: 'email', nullable: true, example: 'budi@example.com' },
          address: { type: 'string', example: 'Jl. Merdeka No. 10, Jakarta' },
          notes: { type: 'string', nullable: true, example: 'Hubungi sebelum datang.' },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      CreateCustomerRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'phone', 'address'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          phone: { type: 'string', minLength: 8, maxLength: 20 },
          email: { type: 'string', format: 'email', nullable: true },
          address: { type: 'string', minLength: 5, maxLength: 500 },
          notes: { type: 'string', maxLength: 1000, nullable: true },
        },
      },
      Pagination: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages', 'hasPreviousPage', 'hasNextPage'],
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 25 },
          totalPages: { type: 'integer', example: 3 },
          hasPreviousPage: { type: 'boolean', example: false },
          hasNextPage: { type: 'boolean', example: true },
        },
      },
      CustomerResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Detail customer berhasil diambil' },
          data: {
            type: 'object',
            required: ['customer'],
            properties: { customer: { $ref: '#/components/schemas/Customer' } },
          },
        },
      },
      CustomerListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Daftar customer berhasil diambil' },
          data: {
            type: 'object',
            required: ['customers', 'pagination'],
            properties: {
              customers: { type: 'array', items: { $ref: '#/components/schemas/Customer' } },
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
        },
      },
      Technician: {
        type: 'object',
        required: ['id', 'name', 'email', 'phone', 'role', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Siti Aminah' },
          email: { type: 'string', format: 'email', example: 'siti@opsmate.test' },
          phone: { type: 'string', nullable: true, example: '081298765432' },
          role: { type: 'string', enum: ['TECHNICIAN'], example: 'TECHNICIAN' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      CreateTechnicianRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', minLength: 8, maxLength: 20 },
          password: { type: 'string', minLength: 8, maxLength: 128, format: 'password' },
        },
      },
      UpdateTechnicianRequest: {
        type: 'object',
        additionalProperties: false,
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string', minLength: 8, maxLength: 20, nullable: true },
        },
      },
      UpdateTechnicianStatusRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['isActive'],
        properties: { isActive: { type: 'boolean' } },
      },
      TechnicianResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Akun teknisi berhasil dibuat' },
          data: {
            type: 'object',
            required: ['technician'],
            properties: { technician: { $ref: '#/components/schemas/Technician' } },
          },
        },
      },
      TechnicianDetail: {
        allOf: [
          { $ref: '#/components/schemas/Technician' },
          {
            type: 'object',
            required: ['assignedWorkOrdersCount'],
            properties: { assignedWorkOrdersCount: { type: 'integer', minimum: 0, example: 4 } },
          },
        ],
      },
      TechnicianDetailResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Detail teknisi berhasil diambil' },
          data: {
            type: 'object',
            required: ['technician'],
            properties: { technician: { $ref: '#/components/schemas/TechnicianDetail' } },
          },
        },
      },
      TechnicianStatusResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Akun teknisi berhasil dinonaktifkan' },
          data: {
            type: 'object',
            required: ['technician', 'revokedSessionsCount'],
            properties: {
              technician: { $ref: '#/components/schemas/Technician' },
              revokedSessionsCount: { type: 'integer', minimum: 0, example: 1 },
            },
          },
        },
      },
      TechnicianListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Daftar teknisi berhasil diambil' },
          data: {
            type: 'object',
            required: ['technicians', 'pagination'],
            properties: {
              technicians: { type: 'array', items: { $ref: '#/components/schemas/Technician' } },
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
        },
      },
      WorkOrderStatus: {
        type: 'string',
        enum: ['PENDING', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        description:
          'Workflow teknisi berjalan berurutan dari ASSIGNED ke ON_THE_WAY, IN_PROGRESS, lalu COMPLETED.',
      },
      AttachmentType: {
        type: 'string',
        enum: ['BEFORE', 'AFTER', 'OTHER'],
        description: 'Kategori evidence sebelum pekerjaan, sesudah pekerjaan, atau attachment pendukung lainnya.',
      },
      WorkOrderCustomer: {
        type: 'object',
        required: ['id', 'name', 'phone', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Budi Santoso' },
          phone: { type: 'string', example: '081234567890' },
          email: { type: 'string', format: 'email', nullable: true, example: 'budi@example.com' },
          address: { type: 'string', example: 'Jl. Merdeka No. 10, Jakarta' },
          notes: { type: 'string', nullable: true, example: 'Hubungi sebelum datang.' },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      WorkOrderTechnician: {
        type: 'object',
        nullable: true,
        required: ['id', 'name', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Siti Aminah' },
          email: { type: 'string', format: 'email', example: 'siti@opsmate.test' },
          phone: { type: 'string', nullable: true, example: '081298765432' },
          role: { type: 'string', enum: ['TECHNICIAN'], example: 'TECHNICIAN' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
        },
      },
      WorkOrderCreatedBy: {
        type: 'object',
        required: ['id', 'name', 'email'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Admin OpsMate' },
          email: { type: 'string', format: 'email', example: 'admin@opsmate.test' },
          role: { $ref: '#/components/schemas/UserRole' },
          isActive: { type: 'boolean', example: true },
        },
      },
      WorkOrderActor: {
        type: 'object',
        required: ['id', 'name', 'role'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          name: { type: 'string', example: 'Siti Aminah' },
          email: { type: 'string', format: 'email', example: 'siti@opsmate.test' },
          role: { $ref: '#/components/schemas/UserRole' },
        },
      },
      WorkOrderStatusHistory: {
        type: 'object',
        required: ['id', 'previousStatus', 'newStatus', 'notes', 'createdAt', 'changedBy'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          previousStatus: {
            allOf: [{ $ref: '#/components/schemas/WorkOrderStatus' }],
            nullable: true,
            example: 'ASSIGNED',
          },
          newStatus: { $ref: '#/components/schemas/WorkOrderStatus' },
          notes: { type: 'string', nullable: true, example: 'Teknisi sedang menuju lokasi customer.' },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          changedBy: { $ref: '#/components/schemas/WorkOrderActor' },
        },
      },
      WorkOrderAttachment: {
        type: 'object',
        required: ['id', 'fileUrl', 'fileName', 'fileType', 'fileSize', 'attachmentType', 'description', 'createdAt', 'uploadedBy'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          workOrderId: { type: 'string', format: 'uuid', example: uuidExample },
          fileUrl: { type: 'string', example: '/uploads/work-orders/evidence.webp' },
          fileName: { type: 'string', example: 'kondisi-ac.webp' },
          fileType: { type: 'string', enum: ['image/jpeg', 'image/png', 'image/webp'], example: 'image/webp' },
          fileSize: {
            type: 'string',
            pattern: '^\\d+$',
            description: 'Ukuran file dalam byte. Dikembalikan sebagai string karena disimpan sebagai BigInt.',
            example: '245760',
          },
          attachmentType: { $ref: '#/components/schemas/AttachmentType' },
          description: { type: 'string', nullable: true, example: 'Kondisi unit sebelum diperbaiki.' },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          uploadedBy: { $ref: '#/components/schemas/WorkOrderActor' },
        },
      },
      WorkOrder: {
        type: 'object',
        required: ['id', 'workOrderNumber', 'title', 'description', 'scheduledAt', 'status', 'createdAt', 'updatedAt', 'customer', 'createdBy'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          workOrderNumber: { type: 'string', example: 'WO-20270820-ABCDEF123456' },
          title: { type: 'string', example: 'Perbaikan AC kantor' },
          description: { type: 'string', example: 'AC lantai dua tidak dingin sejak pagi.' },
          scheduledAt: { type: 'string', format: 'date-time', example: isoDateExample },
          status: { $ref: '#/components/schemas/WorkOrderStatus' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
          customer: { $ref: '#/components/schemas/WorkOrderCustomer' },
          technician: { $ref: '#/components/schemas/WorkOrderTechnician' },
          createdBy: { $ref: '#/components/schemas/WorkOrderCreatedBy' },
        },
      },
      WorkOrderDetail: {
        allOf: [
          { $ref: '#/components/schemas/WorkOrder' },
          {
            type: 'object',
            required: ['statusHistories', 'attachments'],
            properties: {
              statusHistories: {
                type: 'array',
                items: { $ref: '#/components/schemas/WorkOrderStatusHistory' },
              },
              attachments: {
                type: 'array',
                items: { $ref: '#/components/schemas/WorkOrderAttachment' },
              },
            },
          },
        ],
      },
      TechnicianWorkOrder: {
        type: 'object',
        required: ['id', 'workOrderNumber', 'title', 'description', 'scheduledAt', 'status', 'completedAt', 'updatedAt', 'customer'],
        properties: {
          id: { type: 'string', format: 'uuid', example: uuidExample },
          workOrderNumber: { type: 'string', example: 'WO-20270820-ABCDEF123456' },
          title: { type: 'string', example: 'Perbaikan AC kantor' },
          description: { type: 'string', example: 'AC lantai dua tidak dingin sejak pagi.' },
          scheduledAt: { type: 'string', format: 'date-time', example: isoDateExample },
          status: { $ref: '#/components/schemas/WorkOrderStatus' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time', example: isoDateExample },
          updatedAt: { type: 'string', format: 'date-time', example: isoDateExample },
          customer: { $ref: '#/components/schemas/WorkOrderCustomer' },
        },
      },
      CreateWorkOrderRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['customerId', 'title', 'description', 'scheduledAt'],
        properties: {
          customerId: { type: 'string', format: 'uuid' },
          technicianId: { type: 'string', format: 'uuid', nullable: true },
          title: { type: 'string', minLength: 3, maxLength: 150 },
          description: { type: 'string', minLength: 5, maxLength: 5000 },
          scheduledAt: {
            type: 'string',
            format: 'date-time',
            description: 'Wajib berupa waktu masa depan dan menyertakan offset zona waktu.',
          },
        },
      },
      UpdateTechnicianWorkOrderStatusRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'],
            description: 'Harus merupakan status berikutnya dalam workflow teknisi.',
          },
          notes: { type: 'string', minLength: 1, maxLength: 1000 },
        },
      },
      CreateWorkOrderAttachmentRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['file'],
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'Satu file JPEG, PNG, atau WEBP dengan ukuran maksimal 5 MB.',
          },
          AttachmentType: {
            allOf: [{ $ref: '#/components/schemas/AttachmentType' }],
            default: 'OTHER',
            description: 'Nama field mengikuti kontrak API saat ini dan bersifat case-sensitive.',
          },
          description: { type: 'string', minLength: 1, maxLength: 1000 },
        },
      },
      WorkOrderResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Work order berhasil dibuat' },
          data: { $ref: '#/components/schemas/WorkOrder' },
        },
      },
      WorkOrderDetailResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Detail work order berhasil diambil' },
          data: { $ref: '#/components/schemas/WorkOrderDetail' },
        },
      },
      TechnicianWorkOrderDetailResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Detail tugas teknisi berhasil diambil' },
          data: { $ref: '#/components/schemas/WorkOrderDetail' },
        },
      },
      TechnicianWorkOrderStatusResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Status work order berhasil diperbarui' },
          data: { $ref: '#/components/schemas/TechnicianWorkOrder' },
        },
      },
      CreatedWorkOrderAttachment: {
        allOf: [
          { $ref: '#/components/schemas/WorkOrderAttachment' },
          {
            type: 'object',
            required: ['workOrderId'],
            properties: {
              workOrderId: { type: 'string', format: 'uuid', example: uuidExample },
            },
          },
        ],
      },
      WorkOrderAttachmentResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Attachment work order berhasil diunggah' },
          data: { $ref: '#/components/schemas/CreatedWorkOrderAttachment' },
        },
      },
      WorkOrderMeta: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages'],
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          total: { type: 'integer', example: 25 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      WorkOrderListResponse: {
        type: 'object',
        required: ['success', 'message', 'data', 'meta'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Work Orders berhasil diambil' },
          data: { type: 'array', items: { $ref: '#/components/schemas/WorkOrder' } },
          meta: { $ref: '#/components/schemas/WorkOrderMeta' },
        },
      },
      TechnicianWorkOrderListResponse: {
        type: 'object',
        required: ['success', 'message', 'data', 'meta'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Daftar tugas teknisi berhasil diambil' },
          data: { type: 'array', items: { $ref: '#/components/schemas/TechnicianWorkOrder' } },
          meta: { $ref: '#/components/schemas/WorkOrderMeta' },
        },
      },
    },
  },
} as const;

export default openApiSpec;
