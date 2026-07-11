-- Ya aplicada en la base de datos compartida (Neon) desde el repo pos — este
-- archivo solo espeja el historial de migraciones en Festamas, que comparte el
-- mismo schema/base de datos.
-- Ver pos/prisma/migrations/20260710020000_business_discount_limits.
ALTER TABLE "Business" ADD COLUMN IF NOT EXISTS "discountLimits" JSONB;
