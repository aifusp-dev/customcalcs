"use client";

import { useState } from "react";
import { generateInviteLink, revokeInviteLink } from "@/app/actions/invites";

export function InviteLinkSection({
  calculatorId,
  inviteUrl,
}: {
  calculatorId: string;
  inviteUrl: string | null;
}) {
  const [copied, setCopied] = useState(false);

  if (!inviteUrl) {
    return (
      <form action={generateInviteLink.bind(null, calculatorId)}>
        <button
          type="submit"
          className="text-sm border border-neutral-800 rounded-lg px-4 py-2 hover:bg-neutral-900 transition-colors"
        >
          Generar enlace de invitación
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={inviteUrl}
          onFocus={(event) => event.target.select()}
          className="flex-1 min-w-0 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-900 transition-colors whitespace-nowrap"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <form action={generateInviteLink.bind(null, calculatorId)}>
          <button
            type="submit"
            className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 hover:bg-neutral-900 transition-colors"
          >
            Regenerar enlace
          </button>
        </form>
        <form action={revokeInviteLink.bind(null, calculatorId)}>
          <button
            type="submit"
            className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 text-red-400 hover:bg-neutral-900 transition-colors"
          >
            Desactivar
          </button>
        </form>
      </div>
    </div>
  );
}
