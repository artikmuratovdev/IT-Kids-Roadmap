"use client";

import Link from "next/link";
import { months } from "@/content/months";
import type { WeekMeta } from "@/lib/catalog";
import { useStudentState } from "@/lib/data/hooks";
import { gradeLabel } from "@/lib/grading";
import { theme } from "@/lib/theme";

export function MyResults({ weeks }: { weeks: WeekMeta[] }) {
  const st = useStudentState();
  const all = weeks.flatMap((w) => w.lessons);
  if (!st.loaded) return <p className="text-slate-500">Yuklanmoqda...</p>;

  const done = all.filter((l) => st.best(l.id));
  const avg = done.length ? Math.round(done.reduce((s, l) => { const b = st.best(l.id)!; return s + (b.score / b.total) * 100; }, 0) / done.length) : 0;
  const stars = done.filter((l) => { const b = st.best(l.id)!; return b.score === b.total; }).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">⭐ Mening natijalarim</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5 text-center"><p className="text-4xl font-black text-indigo-600">{done.length}</p><p className="text-slate-500">topshirilgan test</p></div>
        <div className="card p-5 text-center"><p className="text-4xl font-black text-emerald-600">{avg}%</p><p className="text-slate-500">o&apos;rtacha natija</p></div>
        <div className="card p-5 text-center"><p className="text-4xl font-black text-amber-500">{stars} 🏆</p><p className="text-slate-500">100% natijalar</p></div>
      </div>
      {months.map((m) => {
        const ls = all.filter((l) => l.month === m.num);
        const t = theme(m.num);
        return (
          <section key={m.num} className="card p-5">
            <h2 className="mb-3 font-black">{m.emoji} {m.num}-oy: {m.title}</h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
              {ls.map((l) => {
                const b = st.best(l.id);
                const p = b ? Math.round((b.score / b.total) * 100) : null;
                return (
                  <Link
                    key={l.id}
                    href={`/darslar/${l.id}`}
                    title={l.title}
                    className={`rounded-xl p-2 text-center ring-1 transition hover:scale-105 ${p === null ? "bg-slate-50 ring-slate-200" : `${t.soft} ${t.border} ring-2`}`}
                  >
                    <p className="text-xs font-bold text-slate-400">{l.num}</p>
                    <p className="text-lg">{p === null ? "·" : gradeLabel(p).emoji}</p>
                    <p className="text-xs font-black">{b ? `${b.score}/${b.total}` : ""}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
