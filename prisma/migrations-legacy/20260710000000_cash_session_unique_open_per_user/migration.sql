-- Evita, a nivel de base de datos, que un mismo usuario tenga dos CashSession
-- con status='OPEN' simultáneas. Ya aplicada en la base de datos compartida
-- (Neon) desde el repo pos — este archivo solo espeja el historial de
-- migraciones en Festamas, que comparte el mismo schema/base de datos.
-- Ver pos/prisma/migrations/20260710000000_cash_session_unique_open_per_user.
CREATE UNIQUE INDEX IF NOT EXISTS "CashSession_userId_open_unique" ON "CashSession"("userId") WHERE "status" = 'OPEN';
