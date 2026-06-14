"use client";

import { unlinkDiscordWebhook } from "@/app/actions/discord";

export function UnlinkDiscordForm({ calculatorId }: { calculatorId: string }) {
  return (
    <form action={unlinkDiscordWebhook.bind(null, calculatorId)}>
      <button
        type="submit"
        className="border border-red-900 text-red-400 rounded-lg px-4 py-2.5 text-sm hover:bg-red-950/40 transition-colors"
      >
        Desvincular canal
      </button>
    </form>
  );
}
