# Prisma Schema OpsMate

## Model

- User
- Customer
- WorkOrder
- WorkOrderStatusHistory
- WorkOrderAttachment

## Enum

- UserRole
- WorkOrderStatus
- AttachmentType

## Naming Convention

- Prisma model menggunakan PascalCase.
- Prisma field menggunakan camelCase.
- PostgreSQL table dan column menggunakan snake_case.
- Mapping dilakuka menggunakan @map dan @@map.

## Migration

Migration pertama:

`init_schema`

Migration membuat lima table utama dan table `_prisma_migration`.