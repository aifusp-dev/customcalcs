import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
            <p className="text-sm text-neutral-400">CustomCalcs</p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm border border-neutral-800 rounded-lg px-4 py-2 hover:bg-neutral-900 transition-colors"
          >
            Volver al panel
          </Link>
        </div>

        <nav className="flex gap-2 border-b border-neutral-800 pb-2">
          <Link
            href="/admin"
            className="text-sm px-3 py-1.5 rounded-md hover:bg-neutral-900 transition-colors"
          >
            Resumen
          </Link>
          <Link
            href="/admin/users"
            className="text-sm px-3 py-1.5 rounded-md hover:bg-neutral-900 transition-colors"
          >
            Usuarios
          </Link>
          <Link
            href="/admin/calculators"
            className="text-sm px-3 py-1.5 rounded-md hover:bg-neutral-900 transition-colors"
          >
            Calculadoras
          </Link>
          <Link
            href="/admin/sales"
            className="text-sm px-3 py-1.5 rounded-md hover:bg-neutral-900 transition-colors"
          >
            Ventas
          </Link>
        </nav>

        {children}
      </div>
    </div>
  );
}
