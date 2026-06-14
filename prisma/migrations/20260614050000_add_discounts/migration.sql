-- CreateTable
CREATE TABLE "discounts" (
    "id" TEXT NOT NULL,
    "calculatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_calculatorId_fkey" FOREIGN KEY ("calculatorId") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: add discount snapshot columns to sales, backfilling subtotal from the existing total
ALTER TABLE "sales" ADD COLUMN "subtotal" DECIMAL(10,2);
ALTER TABLE "sales" ADD COLUMN "discountName" TEXT;
ALTER TABLE "sales" ADD COLUMN "discountPercentage" DECIMAL(5,2);

UPDATE "sales" SET "subtotal" = "total" WHERE "subtotal" IS NULL;

ALTER TABLE "sales" ALTER COLUMN "subtotal" SET NOT NULL;
