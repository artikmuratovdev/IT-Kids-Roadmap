"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/data";
import type { Role } from "@/lib/data/types";

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-slate-500">Yuklanmoqda...</p>;
  if (!user || user.role !== role)
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="mb-3 font-semibold">
          Bu sahifa faqat {role === "teacher" ? "o'qituvchilar" : "o'quvchilar"} uchun.
        </p>
        <Link href="/login" className="btn-primary">Kirish</Link>
      </div>
    );
  return <>{children}</>;
}
