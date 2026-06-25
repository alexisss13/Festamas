-- CreateTable
CREATE TABLE "QuoteTracking" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuoteTracking_quoteId_idx" ON "QuoteTracking"("quoteId");

-- AddForeignKey
ALTER TABLE "QuoteTracking" ADD CONSTRAINT "QuoteTracking_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
