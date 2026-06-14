import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { joinCalculatorViaInvite } from "@/app/actions/invites";

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">CustomCalcs</h1>
          <p className="text-sm text-neutral-400">Invitación a una calculadora</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const calculator = await prisma.calculator.findUnique({
    where: { inviteToken: token },
    select: { id: true, name: true, ownerId: true },
  });

  if (!calculator) {
    return (
      <Page>
        <p className="text-sm text-red-400 text-center">
          Este enlace de invitación no es válido o ha sido desactivado.
        </p>
      </Page>
    );
  }

  const session = await getSession();

  if (!session?.userId) {
    return (
      <Page>
        <p className="text-sm text-neutral-400 text-center">
          Inicia sesión o crea una cuenta en CustomCalcs y vuelve a abrir este
          enlace para unirte a &quot;{calculator.name}&quot;.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-lg bg-white text-black font-semibold px-6 hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="flex h-11 items-center justify-center rounded-lg border border-neutral-800 px-6 hover:bg-neutral-900 transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </Page>
    );
  }

  if (session.userId === calculator.ownerId) {
    return (
      <Page>
        <p className="text-sm text-neutral-400 text-center">
          Ya eres el dueño de &quot;{calculator.name}&quot;.
        </p>
        <Link
          href={`/dashboard/calculators/${calculator.id}`}
          className="flex h-11 items-center justify-center rounded-lg bg-white text-black font-semibold px-6 hover:opacity-90 transition-opacity"
        >
          Ir a la calculadora
        </Link>
      </Page>
    );
  }

  const existingMember = await prisma.calculatorMember.findUnique({
    where: { calculatorId_userId: { calculatorId: calculator.id, userId: session.userId } },
    select: { id: true },
  });

  if (existingMember) {
    return (
      <Page>
        <p className="text-sm text-neutral-400 text-center">
          Ya tienes acceso a &quot;{calculator.name}&quot;.
        </p>
        <Link
          href={`/dashboard/calculators/${calculator.id}`}
          className="flex h-11 items-center justify-center rounded-lg bg-white text-black font-semibold px-6 hover:opacity-90 transition-opacity"
        >
          Ir a la calculadora
        </Link>
      </Page>
    );
  }

  return (
    <Page>
      <p className="text-sm text-neutral-400 text-center">
        Te han invitado a unirte a &quot;{calculator.name}&quot;.
      </p>
      <form action={joinCalculatorViaInvite.bind(null, token)}>
        <button
          type="submit"
          className="w-full bg-white text-black font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity"
        >
          Unirme a la calculadora
        </button>
      </form>
    </Page>
  );
}
