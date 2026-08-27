# Customer Request List and Detail

## Summary

Adds Customer Service Request
history, filtering, detailed tracking,
status timeline, Work Order information,
and cancellation.

## Customer Endpoints

GET /api/service-requests/my

GET /api/service-requests/my/:serviceRequestId

PATCH /api/service-requests/my/:serviceRequestId/cancel

## Request List

Customers can view only their own
Service Requests.

Supported filters:

- all
- SUBMITTED
- UNDER_REVIEW
- ACCEPTED
- REJECTED
- CANCELLED
- CONVERTED

Pagination is supported.

## Request Detail

Detail displays:

- request number
- service type
- problem title
- description
- service address
- contact phone
- preferred schedule
- request status
- created date
- status timeline
- Work Order
- assigned technician

## Timeline

Status history shows:

- new status
- date
- notes
- actor

## Work Order

Before conversion:

workOrder = null

Customer sees that Admin has not
created the Work Order yet.

After conversion the same detail
screen can display Work Order and
Technician information.

## Cancellation

Customer may cancel requests in:

SUBMITTED

UNDER_REVIEW

Requests cannot be cancelled after:

ACCEPTED

REJECTED

CANCELLED

CONVERTED

## Security

Customer identity is resolved
from authentication.

A Customer cannot view another
Customer's Service Request.

## Verification

- Request list passed
- Status filtering passed
- Pagination passed
- Pull-to-refresh passed
- Request detail passed
- Timeline passed
- Work Order empty state passed
- Customer ownership isolation passed
- SUBMITTED cancellation passed
- UNDER_REVIEW cancellation passed
- ACCEPTED cannot be cancelled
- TypeScript passed
- Lint passed
- Backend regression passed
- Physical device test passed
