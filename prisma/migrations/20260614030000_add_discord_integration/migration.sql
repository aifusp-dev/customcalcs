-- CreateTable
CREATE TABLE "discord_webhooks" (
    "id" TEXT NOT NULL,
    "calculatorId" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "guildName" TEXT,
    "channelName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discord_link_tokens" (
    "token" TEXT NOT NULL,
    "webhookUrl" TEXT NOT NULL,
    "guildName" TEXT,
    "channelName" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discord_link_tokens_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_webhooks_calculatorId_key" ON "discord_webhooks"("calculatorId");

-- AddForeignKey
ALTER TABLE "discord_webhooks" ADD CONSTRAINT "discord_webhooks_calculatorId_fkey" FOREIGN KEY ("calculatorId") REFERENCES "calculators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
