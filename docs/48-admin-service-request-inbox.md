# Admin Service Request Inbox

## Summary

Adds Service Request inbox,
filtering, search, detail review,
status transitions, customer
information, timeline, and Work Order
visibility to OpsMate Admin Web.

## Client

web/

ADMIN only.

## Routes

/app/service-requests

/app/service-requests/:serviceRequestId

## API

GET /api/service-requests

GET /api/service-requests/:serviceRequestId

PATCH /api/service-requests/:serviceRequestId/status

## Inbox

Admin can:

- view customer requests
- search requests
- filter by status
- navigate through pagination
- open request details

## Search

Search supports:

- request number
- service type
- title
- customer name
- phone
- email

## Status Workflow

SUBMITTED can transition to:

- UNDER_REVIEW
- ACCEPTED
- REJECTED

UNDER_REVIEW can transition to:

- ACCEPTED
- REJECTED

## Rejection

REJECTED requires an Admin note.

The note becomes part of
Service Request status history.

## Customer Integration

Status changes made by Admin are
visible to the Customer Mobile
application after refresh.

## Work Order

ACCEPTED does not automatically
create a Work Order.

workOrderId remains null until
the assignment/conversion phase.

## Security

All Admin Service Request routes
require authenticated ADMIN role.

Customer and Technician roles
cannot use Admin Service Request
endpoints.

## Verification

- Admin inbox passed
- Search passed
- Status filtering passed
- Pagination passed
- Detail passed
- Customer information passed
- Status timeline passed
- SUBMITTED to UNDER_REVIEW passed
- UNDER_REVIEW to ACCEPTED passed
- SUBMITTED to ACCEPTED passed
- Rejection reason validation passed
- Customer Mobile status sync passed
- CANCELLED request is read-only
- ACCEPTED request has no Work Order yet
- Admin role authorization passed
- Web lint passed
- Web build passed
- Backend regression passed
