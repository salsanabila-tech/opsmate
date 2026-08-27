# Service Request to Work Order Conversion

## Summary

Adds atomic conversion of an
accepted Customer Service Request
into an assigned Work Order.

## Endpoint

POST /api/service-requests/:serviceRequestId/convert

ADMIN only.

## Input

- technicianId
- scheduledAt

Customer ID, title, and description
are derived from the Service Request.

## Preconditions

Service Request must be:

ACCEPTED

Service Request must not already
have a Work Order.

Technician must:

- exist
- have TECHNICIAN role
- be active

Schedule must be in the future.

## Conversion

The conversion runs in one database
transaction.

It:

1. validates Service Request
2. validates Technician
3. creates Work Order
4. creates Work Order status history
5. links Work Order to Service Request
6. changes Service Request to CONVERTED
7. creates Service Request status history

## Work Order

Initial status:

ASSIGNED

The selected Technician is assigned
immediately.

## Service Request

After conversion:

status = CONVERTED

workOrderId = created Work Order ID

## Atomicity

If any step fails, the entire
conversion is rolled back.

A Service Request cannot generate
multiple Work Orders.

## Integration

Admin Web:

Selects Technician and schedule.

Technician Mobile:

Receives the newly assigned Work Order.

Customer Mobile:

Sees CONVERTED status, Work Order,
and assigned Technician.

## Verification

- ACCEPTED conversion passed
- Work Order ASSIGNED passed
- Technician assignment passed
- Service Request CONVERTED passed
- workOrderId linked correctly
- Work Order history created
- Service Request history created
- Technician Mobile task visible
- Customer Mobile Work Order visible
- inactive Technician rejected
- past schedule rejected
- non-ACCEPTED conversion rejected
- duplicate conversion rejected
- Backend typecheck passed
- Backend build passed
- Web lint passed
- Web build passed
- Technician Mobile regression passed
- Customer Mobile regression passed
