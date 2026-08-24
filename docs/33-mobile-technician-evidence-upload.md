# Mobile Technician Evidence Upload

## Summary

Menambahkan upload BEFORE dan AFTER evidence
untuk Technician pada aplikasi mobile OpsMate.

## Endpoint

POST /api/work-orders/my/:workOrderId/attachments

## Multipart Fields

- file
- attachmentType
- description

## Supported Files

- JPEG
- PNG
- WEBP
- Maximum 5 MB

## Workflow

ON_THE_WAY
→ Upload BEFORE
→ IN_PROGRESS

IN_PROGRESS
→ Upload AFTER
→ COMPLETED

## Mobile Features

- Take photo using camera
- Select photo from gallery
- Image preview
- Client file size validation
- Client MIME type validation
- Optional evidence description
- Upload loading state
- Upload error state
- Automatic Work Order detail refresh
- Automatic workflow unlock after evidence upload
- Existing evidence preview

## Security

Mobile validation is UX only.

Backend remains responsible for:

- Authentication
- Technician ownership
- Attachment type validation
- File type validation
- File size validation
- Evidence status rules

## Verification

- Camera permission works
- Gallery permission works
- BEFORE upload works on ON_THE_WAY
- BEFORE appears in Work Order detail
- BEFORE unlocks IN_PROGRESS transition
- AFTER upload works on IN_PROGRESS
- AFTER appears in Work Order detail
- AFTER unlocks COMPLETED transition
- Invalid file type is rejected
- File above 5 MB is rejected
- Upload on invalid status is rejected
- Technician ownership remains enforced
- TypeScript passes
- Expo Doctor passes
- Backend typecheck passes
- Backend build passes
