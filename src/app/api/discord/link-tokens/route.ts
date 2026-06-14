import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const LINK_TOKEN_TTL_MS = 15 * 60 * 1000;
const WEBHOOK_URL_PREFIX = "https://discord.com/api/webhooks/";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.DISCORD_BOT_API_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const webhookUrl = body?.webhookUrl;
  const guildName = body?.guildName;
  const channelName = body?.channelName;

  if (typeof webhookUrl !== "string" || !webhookUrl.startsWith(WEBHOOK_URL_PREFIX)) {
    return NextResponse.json({ error: "Invalid webhookUrl" }, { status: 400 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + LINK_TOKEN_TTL_MS);

  await prisma.discordLinkToken.create({
    data: {
      token,
      webhookUrl,
      guildName: typeof guildName === "string" ? guildName : null,
      channelName: typeof channelName === "string" ? channelName : null,
      expiresAt,
    },
  });

  return NextResponse.json({ token, expiresAt });
}
