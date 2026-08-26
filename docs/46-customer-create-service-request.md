# Customer Create Service Request

## Summary

Adds Service Request creation
to OpsMate Customer Mobile.

## Client

customer-mobile/

CUSTOMER only.

## Endpoint

POST /api/service-requests

## Authentication

The request uses the authenticated
Customer access token.

Customer ID is not accepted from
the mobile application.

Backend resolves:

authenticated user
→ Customer profile
→ customerId

## Input

- serviceType
- title
- description
- serviceAddress
- contactPhone
- preferredSchedule

preferredSchedule is optional.

## Service Types

The UI provides quick selections:

- Mesin Cuci
- AC
- Kulkas
- Televisi
- Elektronik
- Lainnya

## Schedule

Customers may optionally provide
a preferred service date and time.

The final schedule is still subject
to Admin confirmation.

## Created Request

A successful request receives:

- id
- requestNumber
- status
- createdAt

Initial status:

SUBMITTED

Work Order:

null

## Audit Trail

Creating a Service Request also
creates its initial status history:

previousStatus = null

newStatus = SUBMITTED

changedBy = Customer user

## Security

Customer Mobile never sends
customerId.

A customer cannot create a Service
Request using another customer's ID.

## Verification

- Customer Service Request form works
- Service type selection works
- Custom service type works
- Required validation works
- Optional schedule works
- Future schedule validation works
- Authenticated API request works
- Automatic token refresh still works
- Service Request created with 201
- Request number generated
- Initial status is SUBMITTED
- workOrderId is null
- Customer relation is correct
- Status history created
- TypeScript passed
- Lint passed
- Physical device test passed
