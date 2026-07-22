CREATE TYPE "ReturnRequestType" AS ENUM ('RETURN', 'EXCHANGE');

ALTER TABLE "ReturnRequest"
  ADD COLUMN "type" "ReturnRequestType" NOT NULL DEFAULT 'RETURN',
  ADD COLUMN "refundAmount" DECIMAL(10,2),
  ADD COLUMN "refundReference" TEXT,
  ADD COLUMN "processedAt" TIMESTAMP(3);

CREATE INDEX "ReturnRequest_status_idx" ON "ReturnRequest"("status");
