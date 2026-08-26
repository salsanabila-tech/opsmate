# Customer Mobile Foundation

## Summary

Adds a dedicated mobile application
for OpsMate customers.

## Architecture

backend/
web/
mobile/
customer-mobile/

## Client Responsibilities

### Web

ADMIN only.

### Mobile

TECHNICIAN only.

### Customer Mobile

CUSTOMER only.

## Technology

- React Native
- Expo
- TypeScript
- Expo Router
- Safe Area Context

## Application Identity

Name:

OpsMate Customer

Android package:

com.salsanabila.opsmate.customer

Scheme:

opsmate-customer

## Environment

EXPO_PUBLIC_API_URL

Customer Mobile connects to the
same OpsMate backend used by
Admin Web and Technician Mobile.

## Foundation Features

- Separate customer application
- Expo Router
- API configuration
- Base API client
- Network timeout handling
- Health check
- Backend connectivity screen
- Safe area support

## Authentication

Customer authentication is not
implemented in this phase.

It will be implemented in 14I.4.

## Verification

- Customer app launches
- Customer app package is unique
- Expo Router works
- Environment config works
- Backend health check works
- Physical device can reach backend
- TypeScript passes
- Expo Doctor passes
