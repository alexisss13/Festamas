-- Customer: createdAt/updatedAt (faltaban, rompían el query de "nuevos clientes/mes")
-- y soft-delete real (isActive) en vez de destruir datos de contacto al "eliminar"
ALTER TABLE "Customer" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Customer" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Customer" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Customer_businessId_isActive_idx" ON "Customer"("businessId", "isActive");

-- CustomerChild: datos para campañas personalizadas (tienda de juguetes/fiestas)
ALTER TABLE "CustomerChild" ADD COLUMN "gender" TEXT;
ALTER TABLE "CustomerChild" ADD COLUMN "favoriteTheme" TEXT;

-- Nuevo tipo de notificación para el aviso de cumpleaños próximos
ALTER TYPE "NotificationType" ADD VALUE 'CUSTOMER_BIRTHDAY_UPCOMING';
