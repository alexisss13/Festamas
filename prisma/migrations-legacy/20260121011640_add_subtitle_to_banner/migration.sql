/*
  Warnings:

  - The values [TOP_STRIP] on the enum `BannerPosition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BannerPosition_new" AS ENUM ('MAIN_HERO', 'MIDDLE_SECTION');
ALTER TABLE "Banner" ALTER COLUMN "position" TYPE "BannerPosition_new" USING ("position"::text::"BannerPosition_new");
ALTER TYPE "BannerPosition" RENAME TO "BannerPosition_old";
ALTER TYPE "BannerPosition_new" RENAME TO "BannerPosition";
DROP TYPE "BannerPosition_old";
COMMIT;

-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "subtitle" TEXT;
