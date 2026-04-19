-- CreateTable
CREATE TABLE "PaymentCustomization" (
    "id" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "isoCodes" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentCustomization_pkey" PRIMARY KEY ("id")
);
