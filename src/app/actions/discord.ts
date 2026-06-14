"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession, getCalculatorRole } from "@/lib/dal";

export async function linkDiscordChannel(token: string, formData: FormData) {
  const { userId } = await verifySession();
  const calculatorId = formData.get("calculatorId");
  if (typeof calculatorId !== "string") {
    redirect(`/discord/link/${token}?error=1`);
  }

  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    redirect(`/discord/link/${token}?error=1`);
  }

  const linkToken = await prisma.discordLinkToken.findUnique({ where: { token } });
  if (!linkToken || linkToken.expiresAt < new Date()) {
    redirect(`/discord/link/${token}?error=1`);
  }

  await prisma.$transaction([
    prisma.discordWebhook.upsert({
      where: { calculatorId },
      update: {
        webhookUrl: linkToken.webhookUrl,
        guildName: linkToken.guildName,
        channelName: linkToken.channelName,
      },
      create: {
        calculatorId,
        webhookUrl: linkToken.webhookUrl,
        guildName: linkToken.guildName,
        channelName: linkToken.channelName,
      },
    }),
    prisma.discordLinkToken.delete({ where: { token } }),
  ]);

  redirect(`/dashboard/calculators/${calculatorId}/discord`);
}

export async function unlinkDiscordWebhook(calculatorId: string) {
  const { userId } = await verifySession();
  const role = await getCalculatorRole(calculatorId, userId);
  if (role !== "OWNER") {
    throw new Error("No tienes permiso para gestionar esta calculadora.");
  }

  await prisma.discordWebhook.deleteMany({ where: { calculatorId } });
  revalidatePath(`/dashboard/calculators/${calculatorId}/discord`);
}
