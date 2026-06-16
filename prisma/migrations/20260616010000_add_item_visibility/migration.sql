-- AlterTable items: add hidden flag
ALTER TABLE "items" ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable calculators: add hiddenCategories
ALTER TABLE "calculators" ADD COLUMN "hiddenCategories" TEXT;
