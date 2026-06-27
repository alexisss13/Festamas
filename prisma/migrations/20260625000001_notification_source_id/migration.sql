-- Clave de deduplicación opcional para notificaciones generadas por chequeos automáticos
-- (ej. cumpleaños próximos: evita crear el mismo aviso cada vez que se revisa)
ALTER TABLE "Notification" ADD COLUMN "sourceId" TEXT;

CREATE INDEX "Notification_userId_type_sourceId_idx" ON "Notification"("userId", "type", "sourceId");
