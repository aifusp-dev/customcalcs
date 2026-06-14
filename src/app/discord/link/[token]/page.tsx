import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { linkDiscordChannel } from "@/app/actions/discord";

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">CustomCalcs</h1>
          <p className="text-sm text-neutral-400">Vincular canal de Discord</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function DiscordLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const linkToken = await prisma.discordLinkToken.findUnique({ where: { token } });

  if (!linkToken || linkToken.expiresAt < new Date()) {
    return (
      <Page>
        <p className="text-sm text-red-400 text-center">
          Este enlace ha caducado o no es válido. Vuelve a ejecutar{" "}
          <code>/registercalc</code> en Discord para generar uno nuevo.
        </p>
      </Page>
    );
  }

  const session = await getSession();

  if (!session?.userId) {
    return (
      <Page>
        <p className="text-sm text-neutral-400 text-center">
          Inicia sesión en CustomCalcs y vuelve a abrir este enlace para
          elegir qué calculadora vincular
          {linkToken.channelName ? ` a #${linkToken.channelName}` : ""}
          {linkToken.guildName ? ` (${linkToken.guildName})` : ""}.
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

  const calculators = await prisma.calculator.findMany({
    where: { ownerId: session.userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  if (calculators.length === 0) {
    return (
      <Page>
        <p className="text-sm text-neutral-400 text-center">
          No eres dueño de ninguna calculadora. Crea una desde tu panel para
          poder vincularla a un canal de Discord.
        </p>
      </Page>
    );
  }

  return (
    <Page>
      <p className="text-sm text-neutral-400 text-center">
        Elige qué calculadora quieres vincular
        {linkToken.channelName ? ` a #${linkToken.channelName}` : ""}
        {linkToken.guildName ? ` (${linkToken.guildName})` : ""}. Las ventas
        que se registren se publicarán en ese canal.
      </p>

      {error && (
        <p className="text-sm text-red-400 text-center">
          No se ha podido vincular la calculadora. Inténtalo de nuevo.
        </p>
      )}

      <form action={linkDiscordChannel.bind(null, token)} className="space-y-4">
        <div className="space-y-2">
          {calculators.map((calculator) => (
            <label
              key={calculator.id}
              className="flex items-center gap-3 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-neutral-900 transition-colors"
            >
              <input
                type="radio"
                name="calculatorId"
                value={calculator.id}
                required
                className="accent-white"
              />
              {calculator.name}
            </label>
          ))}
        </div>

        <button
          type="submit"
          className="w-full bg-white text-black font-semibold rounded-lg px-4 py-2.5 text-sm hover:opacity-90 transition-opacity"
        >
          Vincular canal
        </button>
      </form>
    </Page>
  );
}
