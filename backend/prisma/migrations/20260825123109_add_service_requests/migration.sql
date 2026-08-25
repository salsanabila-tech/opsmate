-- CreateEnum
CREATE TYPE "service_request_status" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'CONVERTED');

-- CreateTable
CREATE TABLE "service_requests" (
    "id" UUID NOT NULL,
    "request_number" VARCHAR(30) NOT NULL,
    "customer_id" UUID NOT NULL,
    "service_type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "service_address" TEXT NOT NULL,
    "contact_phone" VARCHAR(20) NOT NULL,
    "preferred_schedule" TIMESTAMPTZ(3),
    "status" "service_request_status" NOT NULL DEFAULT 'SUBMITTED',
    "work_order_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_status_histories" (
    "id" UUID NOT NULL,
    "service_request_id" UUID NOT NULL,
    "previous_status" "service_request_status",
    "new_status" "service_request_status" NOT NULL,
    "changed_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_request_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_requests_request_number_key" ON "service_requests"("request_number");

-- CreateIndex
CREATE UNIQUE INDEX "service_requests_work_order_id_key" ON "service_requests"("work_order_id");

-- CreateIndex
CREATE INDEX "service_requests_customer_id_idx" ON "service_requests"("customer_id");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE INDEX "service_requests_preferred_schedule_idx" ON "service_requests"("preferred_schedule");

-- CreateIndex
CREATE INDEX "service_requests_created_at_idx" ON "service_requests"("created_at");

-- CreateIndex
CREATE INDEX "service_request_status_histories_service_request_id_idx" ON "service_request_status_histories"("service_request_id");

-- CreateIndex
CREATE INDEX "service_request_status_histories_changed_by_idx" ON "service_request_status_histories"("changed_by");

-- CreateIndex
CREATE INDEX "service_request_status_histories_created_at_idx" ON "service_request_status_histories"("created_at");

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_work_order_id_fkey" FOREIGN KEY ("work_order_id") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_status_histories" ADD CONSTRAINT "service_request_status_histories_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_status_histories" ADD CONSTRAINT "service_request_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
