/*
  Warnings:

  - You are about to drop the column `btnColor` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `btnText` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `btnTextColor` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Banner` table. All the data in the column will be lost.
  - You are about to drop the column `textColor` on the `Banner` table. All the data in the column will be lost.
  - Added the required column `division` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Banner` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `position` on the `Banner` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Division" AS ENUM ('JUGUETERIA', 'FIESTAS');

-- CreateEnum
CREATE TYPE "BannerPosition" AS ENUM ('TOP_STRIP', 'MAIN_HERO');

-- AlterTable
ALTER TABLE "Banner" DROP COLUMN "btnColor",
DROP COLUMN "btnText",
DROP COLUMN "btnTextColor",
DROP COLUMN "image",
DROP COLUMN "isActive",
DROP COLUMN "size",
DROP COLUMN "textColor",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "division" "Division" NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "mobileUrl" TEXT,
ALTER COLUMN "link" DROP NOT NULL,
DROP COLUMN "position",
ADD COLUMN     "position" "BannerPosition" NOT NULL;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "division" "Division" NOT NULL DEFAULT 'JUGUETERIA',
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountPercentage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "division" "Division" NOT NULL DEFAULT 'JUGUETERIA',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "wholesaleMinCount" INTEGER,
ADD COLUMN     "wholesalePrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "StoreConfig" ALTER COLUMN "welcomeMessage" SET DEFAULT 'Hola Festamas, quiero confirmar mi pedido...',
ALTER COLUMN "heroButtonText" SET DEFAULT 'Ver Juguetes',
ALTER COLUMN "heroSubtitle" SET DEFAULT 'Encuentra el regalo perfecto en Festamas',
ALTER COLUMN "heroTitle" SET DEFAULT 'Juguetes y Alegría';

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "tag" TEXT NOT NULL,
    "division" "Division" NOT NULL DEFAULT 'JUGUETERIA',
    "icon" TEXT NOT NULL DEFAULT 'star',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);
