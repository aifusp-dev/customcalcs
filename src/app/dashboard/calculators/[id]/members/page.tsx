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

        {members.length === 0 ? (
          <p className="text-sm text-neutral-400">
            Todavía no has invitado a ningún usuario.
          </p>
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                calculatorId={id}
                member={{
                  id: member.id,
                  role: member.role,
                  name: member.user.name,
                  email: member.user.email,
                }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
