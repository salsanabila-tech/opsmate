# Customer Live Status Tracking

## Summary

Adds near-live Work Order tracking
to OpsMate Customer Mobile.

## Flow

Admin converts an accepted Service
Request into a Work Order.

Technician progresses through:

ASSIGNED

ON_THE_WAY

IN_PROGRESS

COMPLETED

Customer Mobile automatically
reflects those changes.

## API

Existing endpoint:

GET /api/service-requests/my/:serviceRequestId

No new Customer route is required.

## Work Order Data

Customer receives:

- Work Order number
- status
- scheduled time
- completed time
- assigned Technician
- status timestamps

Internal Work Order notes and
attachments are not exposed.

## Live Tracking

Customer detail automatically
refreshes every 10 seconds while
the request is active.

Polling runs only while the
application is in the foreground.

## App Resume

When Customer Mobile returns from
background to active state, the
latest Service Request and Work
Order status is fetched immediately.

## Terminal Status

Automatic polling stops when the
Work Order reaches:

COMPLETED

or

CANCELLED

It also stops for terminal
Service Request states such as:

REJECTED

CANCELLED

## Progress

Customer can see:

1. Technician assigned
2. Technician on the way
3. Service in progress
4. Service completed

Each completed step includes the
recorded status timestamp.

## Network Resilience

A temporary network failure does
not remove previously loaded data.

The UI reports a synchronization
problem while retaining the latest
known status.

## Security

Customer ownership continues to be
resolved from authentication.

Customers cannot track another
Customer's Service Request or
Work Order.

## Verification

- ASSIGNED tracking passed
- ON_THE_WAY automatic update passed
- IN_PROGRESS automatic update passed
- COMPLETED automatic update passed
- Work Order timeline passed
- Technician name passed
- schedule passed
- completedAt passed
- foreground polling passed
- background polling avoided
- immediate refresh on resume passed
- polling stops after completion
- network failure keeps existing data
- ownership isolation passed
- Backend typecheck passed
- Backend build passed
- Customer TypeScript passed
- Customer lint passed
- Technician regression passed
- Admin Web regression passed
