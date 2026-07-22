-- Ya aplicada en la base de datos compartida (Neon) desde el repo pos — este
-- archivo solo espeja el historial de migraciones en Festamas, que comparte el
-- mismo schema/base de datos.
-- Ver pos/prisma/migrations/20260710010000_arpayment_method_and_cash_session.
ALTER TABLE "ARPayment" ADD COLUMN IF NOT EXISTS "method" "PaymentMethod" NOT NULL DEFAULT 'CASH';
ALTER TABLE "ARPayment" ADD COLUMN IF NOT EXISTS "cashSessionId" TEXT;

DO $$ BEGIN
  ALTER TABLE "ARPayment" ADD CONSTRAINT "ARPayment_cashSessionId_fkey"
    FOREIGN KEY ("cashSessionId") REFERENCES "CashSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "ARPayment_cashSessionId_idx" ON "ARPayment"("cashSessionId");
