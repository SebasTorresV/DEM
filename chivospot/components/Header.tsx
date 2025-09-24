"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary-600">
          <span aria-hidden>🦎</span>
          <span>ChivoSpot</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {role === "organizer" && (
            <Link href="/organizador" className="hover:text-primary-500">
              Organizador
            </Link>
          )}
          {role === "admin" && (
            <Link href="/admin" className="hover:text-primary-500">
              Admin
            </Link>
          )}
          {session ? (
            <>
              <Link href="/perfil" className="font-medium hover:text-primary-500">
                {session.user?.name ?? "Perfil"}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full bg-primary-500 px-3 py-1 text-white hover:bg-primary-600"
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-full bg-primary-500 px-3 py-1 text-white hover:bg-primary-600">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
