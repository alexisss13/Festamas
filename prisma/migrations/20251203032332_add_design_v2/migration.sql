-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "btnColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "btnText" TEXT NOT NULL DEFAULT 'Ver Más',
ADD COLUMN     "position" TEXT NOT NULL DEFAULT 'TOP',
ADD COLUMN     "size" TEXT NOT NULL DEFAULT 'GRID';

-- AlterTable
ALTER TABLE "StoreConfig" ADD COLUMN     "heroBtnColor" TEXT NOT NULL DEFAULT '#fb3099',
ALTER COLUMN "heroButtonLink" SET DEFAULT '#catalogo';
