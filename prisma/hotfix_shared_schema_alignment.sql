-- Hotfix idempotente para una base compartida con historial Prisma desalineado.
-- No elimina ni modifica datos existentes; solo agrega columnas/índices ausentes.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ReturnRequestType') THEN
    CREATE TYPE "ReturnRequestType" AS ENUM ('RETURN', 'EXCHANGE');
  END IF;
END $$;

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "culqiPaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "packedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "packedById" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "packingNotes" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_culqiPaymentId_key" ON "Order"("culqiPaymentId");

ALTER TABLE "StockReservation" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
CREATE INDEX IF NOT EXISTS "StockReservation_branchId_variantId_idx" ON "StockReservation"("branchId", "variantId");

ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "templateKey" TEXT NOT NULL DEFAULT 'classic';
ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "themeConfig" JSONB;
CREATE INDEX IF NOT EXISTS "StoreConfig_businessId_branchId_idx" ON "StoreConfig"("businessId", "branchId");

ALTER TABLE "PopupConfig" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "PopupConfig" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);

ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "type" "ReturnRequestType" NOT NULL DEFAULT 'RETURN';
ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(10,2);
ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "refundReference" TEXT;
ALTER TABLE "ReturnRequest" ADD COLUMN IF NOT EXISTS "processedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "ReturnRequest_status_idx" ON "ReturnRequest"("status");
