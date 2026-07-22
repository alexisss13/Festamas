/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Coupon` table. All the data in the column will be lost.
  - You are about to drop the column `usedCount` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "expiresAt",
DROP COLUMN "startsAt",
DROP COLUMN "usedCount",
ADD COLUMN     "currentUses" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "expirationDate" TIMESTAMP(3);
