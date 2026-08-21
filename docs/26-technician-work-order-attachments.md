# Technician Work Order Attachments

## Summary

Menambahkan upload attachment Work Order oleh TECHNICIAN.

## Endpoint

POST /api/work-orders/my/:workOrderId/attachments

## Content Type

multipart/form-data

## Fields

- file — required
- attachmentType — BEFORE | AFTER | OTHER
- description — optional

## Supported Files

- JPEG
- PNG
- WEBP

Maximum file size:

5 MB

## Authorization

TECHNICIAN only.

Technician hanya dapat mengunggah attachment ke Work Order yang ditugaskan kepadanya.

## Security

Backend melakukan:

- authentication
- role authorization
- Work Order ownership validation
- maximum file size validation
- declared MIME validation
- actual file content detection
- random server-side filename generation
- original filename sanitization

## Storage

Development storage:

backend/uploads/work-orders

Database hanya menyimpan metadata dan file URL.

## Attachment Metadata

Data yang disimpan:

- workOrderId
- uploadedById
- fileUrl
- fileName
- fileType
- fileSize
- attachmentType
- description
- createdAt

## Verification

- JPEG berhasil diupload
- PNG berhasil diupload
- WEBP berhasil diupload
- file metadata tersimpan di PostgreSQL
- fileSize dikembalikan sebagai string
- file dapat diakses melalui fileUrl
- attachment muncul di detail Work Order
- missing file menghasilkan 422
- unsupported file menghasilkan 415
- file lebih dari 5 MB menghasilkan 413
- invalid UUID menghasilkan 422
- Work Order teknisi lain menghasilkan 404
- ADMIN menghasilkan 403
- tanpa token menghasilkan 401
- typecheck berhasil
- build berhasil
- regression test berhasil
