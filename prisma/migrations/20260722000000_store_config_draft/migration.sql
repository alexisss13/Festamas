-- Columna nullable, retrocompatible: negocios existentes quedan con draftConfig
-- NULL (sin cambios pendientes) hasta que alguien edite la configuración de
-- tienda desde el admin de ecommerce.
ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "draftConfig" JSONB;
