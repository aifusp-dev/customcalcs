import Link from "next/link";
import { InstallAppButton } from "@/components/install-app-button";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">CustomCalcs</h1>
          <p className="text-lg text-neutral-400">
            Crea tus propias calculadoras de precios, gestiona productos con
            imágenes, controla tu stock e invita a otros usuarios a vender
            contigo.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-lg bg-white text-black font-semibold px-6 hover:opacity-90 transition-opacity sm:w-auto"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="flex h-12 w-full items-center justify-center rounded-lg border border-neutral-800 px-6 hover:bg-neutral-900 transition-colors sm:w-auto"
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="flex justify-center">
          <InstallAppButton />
        </div>
      </div>
    </div>
  );
}
