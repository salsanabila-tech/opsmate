# Customer Mobile Authentication

## Summary

Adds customer registration,
authentication, secure token storage,
session restoration, automatic token
refresh, and customer-only routing.

## Client

customer-mobile/

CUSTOMER only.

## Authentication Endpoints

POST /api/auth/register/customer

POST /api/auth/login

POST /api/auth/refresh

GET /api/auth/me

POST /api/auth/logout

## Registration

Customer registers using:

- name
- email
- phone
- address
- password

After successful registration,
the application automatically logs
the customer in.

## Token Storage

Access token and refresh token
are stored using Expo SecureStore.

Keys:

opsmate.customer.access_token

opsmate.customer.refresh_token

## Token Refresh

Authenticated API requests retry
once after receiving 401.

The refresh token is sent to:

POST /api/auth/refresh

Rotated tokens replace the old
tokens in SecureStore.

## Role Isolation

CUSTOMER:

Allowed.

ADMIN:

Rejected.

TECHNICIAN:

Rejected.

## Customer Profile

Authenticated Customer must have:

role = CUSTOMER

and

customerId != null

## Protected Routes

/customer/\*

requires an authenticated Customer.

## Session Restoration

Application startup checks the
stored refresh token and calls:

GET /api/auth/me

Valid Customer sessions are
restored automatically.

## Logout

Logout revokes the server session
and clears local SecureStore tokens.

## Verification

- Register Customer passed
- Automatic login passed
- Customer login passed
- SecureStore passed
- Session restore passed
- Access token refresh passed
- Logout passed
- Duplicate email rejected
- Invalid credentials rejected
- Admin rejected from Customer Mobile
- Technician rejected from Customer Mobile
- Customer ID available
- TypeScript passed
- Physical device test passed
