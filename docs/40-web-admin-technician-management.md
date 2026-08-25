# Web Admin Technician Management

## Summary

Menambahkan technician management
pada OpsMate Web Admin.

## API

GET /api/users/technicians

POST /api/users/technicians

GET /api/users/technicians/:technicianId

PATCH /api/users/technicians/:technicianId

PATCH /api/users/technicians/:technicianId/status

## Features

- Technician list
- Search
- Status filter
- Pagination
- Create technician account
- Technician detail
- Edit technician
- Activate technician
- Deactivate technician
- Session revocation on deactivation
- Assigned Work Order count
- Loading state
- Error state
- Empty state
- React Query invalidation

## Search

Technicians can be searched by:

- Name
- Email

## Filters

- All
- Active
- Inactive

## Create Validation

- Name: 2-100 characters
- Valid email
- Phone: optional, 8-20 characters
- Password: 8-128 characters

## Edit

Editable fields:

- Name
- Email
- Phone

Password editing is not implemented
because the current backend does not
provide an admin password reset endpoint.

## Deactivation

Deactivating a technician:

- Sets isActive to false
- Revokes active authentication sessions
- Prevents continued authenticated usage

Historical Work Order assignments remain intact.

## Authorization

ADMIN only.

## Verification

- Technician list works
- Search works
- Status filtering works
- Pagination works
- Create works
- Duplicate email is rejected
- Detail works
- Edit works
- Deactivation works
- Active sessions are revoked
- Reactivation works
- Technician options are synchronized
- Dashboard count remains synchronized
- Backend typecheck passes
- Backend build passes
- Web lint passes
- Web build passes
