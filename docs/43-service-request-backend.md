# Service Request Backend

## Summary

Adds the Service Request domain
used by Customer Mobile to request
new service work.

## Flow

CUSTOMER

Create Service Request

SUBMITTED

ADMIN

Review Request

UNDER_REVIEW

ACCEPTED / REJECTED

Accepted Service Requests will be
converted to Work Orders in a later step.

## Statuses

- SUBMITTED
- UNDER_REVIEW
- ACCEPTED
- REJECTED
- CANCELLED
- CONVERTED

## Customer API

POST /api/service-requests

GET /api/service-requests/my

GET /api/service-requests/my/:serviceRequestId

PATCH /api/service-requests/my/:serviceRequestId/cancel

## Admin API

GET /api/service-requests

GET /api/service-requests/:serviceRequestId

PATCH /api/service-requests/:serviceRequestId/status

## Security

Customer identity is derived from
the authenticated user.

Clients cannot supply customerId.

A customer cannot access another
customer's Service Request.

## Work Order

Service Requests are separate from
Work Orders.

No Work Order is automatically
created during this phase.

The ServiceRequest.workOrderId
relation is prepared for later
conversion.

## Verification

- Prisma migration passed
- Customer create passed
- Customer list passed
- Customer detail passed
- Customer ownership isolation passed
- Customer cancellation passed
- Admin list passed
- Admin search passed
- Admin status filter passed
- Admin detail passed
- UNDER_REVIEW passed
- ACCEPTED passed
- REJECTED passed
- Invalid transitions rejected
- Work Order regression passed
- Backend typecheck passed
- Backend build passed
