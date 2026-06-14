"use client";

import { useActionState } from "react";
import { inviteMember } from "@/app/actions/members";

export default function InviteMemberForm({ calculatorId }: { calculatorId: string }) {
  const action = inviteMember.bind(null, calculatorId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-md">
      <div className="flex-1 space-y-1.5">
        <label htmlFor="email" className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
          Email del usuario a invitar
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="usuario@ejemplo.com"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        />
        {state?.errors?.email && (
          <p className="text-xs text-red-400">{state.errors.email[0]}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-[var(--accent)] text-[var(--accent-fg)] font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
      >
        {pending ? "Invitando..." : "Invitar"}
      </button>

      {state?.message && (
        <p className="text-sm text-neutral-400 sm:basis-full">{state.message}</p>
      )}
    </form>
  );
}
