"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { store, useAuth } from "@/lib/data";

export function Header() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const path = usePathname();
  if (path.startsWith("/taqdimot")) return null;

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-bold ${path.startsWith(href) ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-2 flex items-center gap-2 text-xl font-black text-indigo-700">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">💻</span>
          IT Kids
        </Link>
        {store.mode === "demo" && <span className="chip bg-amber-100 text-amber-800">DEMO</span>}
        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {link("/darslar", "📚 Darslar")}
          {user?.role === "student" && link("/natijalarim", "⭐ Natijalarim")}
          {user?.role === "teacher" && link("/oqituvchi", "🧑‍🏫 O'qituvchi paneli")}
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm font-semibold text-slate-600 sm:inline">
              {user.role === "teacher" ? "🧑‍🏫" : "🧒"} {user.full_name}
            </span>
            <button
              className="btn-ghost text-sm"
              onClick={async () => {
                await store.signOut();
                setUser(null);
                router.push("/");
              }}
            >
              Chiqish
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link href="/login" className="btn-ghost text-sm">Kirish</Link>
            <Link href="/register" className="btn-primary text-sm">Ro&apos;yxatdan o&apos;tish</Link>
          </div>
        )}
      </div>
    </header>
  );
}
