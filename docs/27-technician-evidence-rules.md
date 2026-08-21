# Technician Work Order Evidence Rules

## Summary

Menambahkan business rules BEFORE dan AFTER evidence
ke dalam workflow Work Order TECHNICIAN.

## Workflow

ASSIGNED
→ ON_THE_WAY
→ BEFORE evidence
→ IN_PROGRESS
→ AFTER evidence
→ COMPLETED

## BEFORE Evidence

Attachment dengan type BEFORE hanya dapat diunggah
ketika Work Order memiliki status ON_THE_WAY.

Minimal satu BEFORE evidence wajib tersedia sebelum
status dapat berubah dari ON_THE_WAY menjadi IN_PROGRESS.

## AFTER Evidence

Attachment dengan type AFTER hanya dapat diunggah
ketika Work Order memiliki status IN_PROGRESS.

Minimal satu AFTER evidence wajib tersedia sebelum
status dapat berubah dari IN_PROGRESS menjadi COMPLETED.

## OTHER Attachment

Attachment OTHER dapat diunggah pada status:

- ASSIGNED
- ON_THE_WAY
- IN_PROGRESS

Attachment tidak dapat diunggah setelah Work Order COMPLETED.

## Business Rule Errors

BEFORE_EVIDENCE_NOT_ALLOWED
→ BEFORE diupload pada status selain ON_THE_WAY

AFTER_EVIDENCE_NOT_ALLOWED
→ AFTER diupload pada status selain IN_PROGRESS

BEFORE_EVIDENCE_REQUIRED
→ mencoba memulai pekerjaan tanpa BEFORE evidence

AFTER_EVIDENCE_REQUIRED
→ mencoba menyelesaikan pekerjaan tanpa AFTER evidence

ATTACHMENT_UPLOAD_NOT_ALLOWED
→ upload attachment pada status yang tidak mengizinkan upload

## Security

Resource ownership tetap berlaku.

Technician hanya dapat:

- melihat Work Order miliknya
- mengubah status Work Order miliknya
- mengunggah evidence pada Work Order miliknya

## Verification

- ASSIGNED → ON_THE_WAY berhasil
- BEFORE pada ASSIGNED ditolak
- AFTER pada ON_THE_WAY ditolak
- ON_THE_WAY → IN_PROGRESS tanpa BEFORE ditolak
- BEFORE pada ON_THE_WAY berhasil
- ON_THE_WAY → IN_PROGRESS setelah BEFORE berhasil
- BEFORE pada IN_PROGRESS ditolak
- IN_PROGRESS → COMPLETED tanpa AFTER ditolak
- AFTER pada IN_PROGRESS berhasil
- IN_PROGRESS → COMPLETED setelah AFTER berhasil
- completedAt terisi
- upload setelah COMPLETED ditolak
- evidence muncul pada detail Work Order
- typecheck berhasil
- build berhasil
- regression test berhasil
