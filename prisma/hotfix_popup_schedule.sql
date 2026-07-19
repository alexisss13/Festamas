-- Hotfix idempotente para bases existentes cuyo historial Prisma no contiene
-- la migración inicial. Ejecutar una sola vez con prisma db execute.
ALTER TABLE "PopupConfig" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3);
ALTER TABLE "PopupConfig" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3);
