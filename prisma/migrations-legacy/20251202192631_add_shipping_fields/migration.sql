-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryMethod" TEXT NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingCost" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "StoreConfig" ADD COLUMN     "localDeliveryPrice" DECIMAL(10,2) NOT NULL DEFAULT 10.00;
