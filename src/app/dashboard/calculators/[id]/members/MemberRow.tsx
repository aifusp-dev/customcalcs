"use client";

import { useRef } from "react";
import { setMemberRole, removeMember } from "@/app/actions/members";

export default function MemberRow({
  calculatorId,
  member,
}: {
  calculatorId: string;
  member: { id: string; role: string; name: string; accountName: string | null; email: string };
}) {
  const roleFormRef = useRef<HTMLFormElement>(null);
  const setRole = setMemberRole.bind(null, calculatorId, member.id);
  const remove = removeMember.bind(null, calculatorId, member.id);

  return (
    <li className="flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {member.name}
          {member.accountName && (
            <span className="text-neutral-400"> ({member.accountName})</span>
          )}
        </p>
        <p className="text-xs text-neutral-400 truncate">{member.email}</p>
      </div>

      <form ref={roleFormRef} action={setRole}>
        <select
          name="role"
          defaultValue={member.role}
          onChange={() => roleFormRef.current?.requestSubmit()}
          className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-neutral-500 transition-colors"
        >
          <option value="MEMBER">Miembro</option>
          <option value="EDITOR">Editor</option>
        </select>
      </form>

      <form action={remove}>
        <button
          type="submit"
          className="text-sm border border-neutral-800 rounded-lg px-3 py-1.5 text-red-400 hover:bg-neutral-900 transition-colors"
        >
          Quitar
        </button>
      </form>
    </li>
  );
}
