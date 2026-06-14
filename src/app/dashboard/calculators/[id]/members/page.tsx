import { notFound } from "next/navigation";
import { verifySession, getCalculatorRole } from "@/lib/dal";
import { prisma } from "@/lib/db";
import InviteMemberForm from "./InviteMemberForm";
import MemberRow from "./MemberRow";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await verifySession();
  const role = await getCalculatorRole(id, userId);
  if (role !== "OWNER") notFound();

  const members = await prisma.calculatorMember.findMany({
    where: { calculatorId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const calculator = await prisma.calculator.findUnique({
    where: { id },
    select: { ownerId: true, ownerDisplayName: true, owner: { select: { name: true, email: true } } },
  });

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Invitar usuario</h2>
          <p className="text-sm text-neutral-400">
            Invita a un usuario ya registrado en CustomCalcs introduciendo su email.
          </p>
        </div>
        <InviteMemberForm calculatorId={id} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Usuarios con acceso</h2>

        <ul className="space-y-2">
          {calculator && (
            <li className="flex items-center gap-4 border border-neutral-800 rounded-lg px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {calculator.ownerDisplayName || calculator.owner.name}
                  {calculator.ownerDisplayName && (
                    <span className="text-neutral-400"> ({calculator.owner.name})</span>
                  )}
                </p>
                <p className="text-xs text-neutral-400 truncate">{calculator.owner.email}</p>
              </div>
              <span className="text-sm text-neutral-400">Dueño</span>
            </li>
          )}

          {members.map((member) => (
            <MemberRow
              key={member.id}
              calculatorId={id}
              member={{
                id: member.id,
                role: member.role,
                name: member.displayName || member.user.name,
                accountName: member.displayName ? member.user.name : null,
                email: member.user.email,
              }}
            />
          ))}
        </ul>

        {members.length === 0 && (
          <p className="text-sm text-neutral-400">
            Todavía no has invitado a ningún otro usuario.
          </p>
        )}
      </div>
    </section>
  );
}
