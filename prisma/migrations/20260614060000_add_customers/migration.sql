-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "calculatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_calculatorId_fkey" FOREIGN KEY ("calculatorId") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
