# Customer Account Foundation

## Summary

Adds CUSTOMER authentication identity
and links registered accounts to
existing Customer profiles.

## User Roles

- ADMIN
- TECHNICIAN
- CUSTOMER

## Customer Relationship

Registered customer:

User
1:1
Customer

Manual Admin customer:

Customer.userId = null

## Registration

POST /api/auth/register/customer

Fields:

- name
- email
- phone
- password
- address

## Existing Customer Linking

If exactly one unlinked Customer
with the same email exists,
registration links that profile
instead of creating a duplicate.

## Authentication

Customers reuse the existing:

- login
- refresh
- me
- logout

## Role Isolation

- Admin Web remains ADMIN only
- Technician Mobile remains TECHNICIAN only
- Customer client will be CUSTOMER only

## Verification

- Prisma migration passed
- CUSTOMER role created
- Customer registration passed
- Customer profile link passed
- Duplicate email rejected
- Login passed
- Refresh passed
- /auth/me returns customerId
- Existing Admin login passed
- Existing Technician login passed
- Web rejects CUSTOMER
- Technician Mobile rejects CUSTOMER
