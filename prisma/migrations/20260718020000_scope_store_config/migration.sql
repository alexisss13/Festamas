ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "businessId" TEXT;
ALTER TABLE "StoreConfig" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
CREATE INDEX IF NOT EXISTS "StoreConfig_businessId_branchId_idx" ON "StoreConfig"("businessId", "branchId");
ALTER TABLE "StoreConfig" ADD CONSTRAINT "StoreConfig_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreConfig" ADD CONSTRAINT "StoreConfig_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
