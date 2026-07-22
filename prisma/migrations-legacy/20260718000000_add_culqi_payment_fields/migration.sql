-- Fase 0/1: proveedor de pagos del ecommerce.
-- Esta migración debe ejecutarse una sola vez contra la base compartida.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "culqiPaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "couponCode" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Order_culqiPaymentId_key"
  ON "Order"("culqiPaymentId");

ALTER TABLE "StockReservation" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
CREATE INDEX IF NOT EXISTS "StockReservation_branchId_variantId_idx"
  ON "StockReservation"("branchId", "variantId");
ALTER TABLE "StockReservation"
  ADD CONSTRAINT "StockReservation_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
