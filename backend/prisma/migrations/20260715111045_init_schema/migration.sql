CREATE TYPE "user_role" AS ENUM ('ADMIN', 'TECHNICIAN');

CREATE TYPE "work_order_status" AS ENUM ('PENDING', 'ASSIGNED', 'ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TYPE "attachment_type" AS ENUM ('BEFORE', 'AFTER', 'OTHER');

CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "role" "user_role" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150),
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_orders" (
    "id" UUID NOT NULL,
    "work_order_number" VARCHAR(30) NOT NULL,
    "customer_id" UUID NOT NULL,
    "technician_id" UUID,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "scheduled_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "work_order_status" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMPTZ(3),
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_order_status_histories" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "previous_status" "work_order_status",
    "new_status" "work_order_status" NOT NULL,
    "changed_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_status_histories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_order_attachments" (
    "id" UUID NOT NULL,
    "work_order_id" UUID NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_type" VARCHAR(100) NOT NULL,
    "file_size" BIGINT NOT NULL,
    "attachment_type" "attachment_type" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_order_attachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

CREATE INDEX "customers_phone_idx" ON "customers"("phone");

CREATE UNIQUE INDEX "work_orders_work_order_number_key" ON "work_orders"("work_order_number");

CREATE INDEX "work_orders_customer_id_idx" ON "work_orders"("customer_id");

CREATE INDEX "work_orders_technician_id_idx" ON "work_orders"("technician_id");

CREATE INDEX "work_orders_created_by_idx" ON "work_orders"("created_by");

CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

CREATE INDEX "work_orders_scheduled_at_idx" ON "work_orders"("scheduled_at");

CREATE INDEX "work_order_status_histories_work_order_id_idx" ON "work_order_status_histories"("work_order_id");

CREATE INDEX "work_order_status_histories_changed_by_idx" ON "work_order_status_histories"("changed_by");

CREATE INDEX "work_order_status_histories_created_at_idx" ON "work_order_status_histories"("created_at");

CREATE INDEX "work_order_attachments_work_order_id_idx" ON "work_order_attachments"("work_order_id");

CREATE INDEX "work_order_attachments_uploaded_by_idx" ON "work_order_attachments"("uploaded_by");

CREATE INDEX "work_order_attachments_attachment_type_idx" ON "work_order_attachments"("attachment_type");

CREATE INDEX "work_order_attachments_created_at_idx" ON "work_order_attachments"("created_at");

ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_status_histories" ADD CONSTRAINT "work_order_status_histories_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_status_histories" ADD CONSTRAINT "work_order_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "work_order_attachments" ADD CONSTRAINT "work_order_attachments_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "work_order_attachments" ADD CONSTRAINT "work_order_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
