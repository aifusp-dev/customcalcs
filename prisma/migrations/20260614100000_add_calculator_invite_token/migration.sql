-- AlterTable
ALTER TABLE "calculators" ADD COLUMN "inviteToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "calculators_inviteToken_key" ON "calculators"("inviteToken");
