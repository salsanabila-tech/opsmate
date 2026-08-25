# Web Admin Customer Management

## Summary

Menambahkan customer management
pada OpsMate Web Admin.

## API

GET /api/customers

POST /api/customers

GET /api/customers/:customerId

PATCH /api/customers/:customerId

## Features

- Customer list
- Search
- Pagination
- Customer creation
- Customer detail
- Customer editing
- Loading state
- Error state
- Empty state
- Query invalidation
- Dashboard synchronization

## Search Fields

- Name
- Phone
- Email

## Validation

- Name: 2-100 characters
- Phone: 8-20 characters
- Email: optional valid email
- Address: 5-500 characters
- Notes: maximum 1000 characters

## Authorization

ADMIN only.

## Delete Policy

Customer deletion is intentionally
not implemented because existing
customers may be referenced by
historical Work Orders.

## Verification

- Customer list works
- Search works
- Pagination works
- Create works
- Detail works
- Edit works
- Invalid input is rejected
- Invalid customer ID is handled
- Dashboard count updates
- Customer selector updates
- Backend typecheck passes
- Backend build passes
- Web lint passes
- Web build passes
