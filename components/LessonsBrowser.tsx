"use client";

import Link from "next/link";
import { useState } from "react";
import { months } from "@/content/months";
import type { WeekMeta } from "@/lib/catalog";
import { useAuth } from "@/lib/data";
import { useStudentState } from "@/lib/data/hooks";
import { theme } from "@/lib/theme";

export function LessonsBrowser({ weeks }: { weeks: WeekMeta[] }) {
  const { user } = useAuth();
  const st = useStudentState();
  const all = weeks.flatMap((w) => w.lessons);
  const current = all.find((l) => l.id === st.current);
  const [month, setMonth] = useState<number>(current?.month ?? 1);
  const shownMonth = months.find((m) => m.num === month)!;
  const t = theme(month);
  const done = all.filter((l) => st.best(l.id)).length;

  return (
    <div className="space-y-6">
      {user?.role === "student" && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-5 md:col-span-2">
            {st.group ? (
              current ? (
                <div>
                  <p className="text-sm font-bold text-slate-500">📍 Bugungi dars ({st.group.name})</p>
                  <h2 className="mt-1 text-2xl font-black">{current.num}. {current.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/darslar/${current.id}`} className="btn-primary">Darsni ochish</Link>
                    {st.status(current.id)?.test_open && (
                      <Link href={`/darslar/${current.id}/test`} className="btn-green">📝 Testni boshlash</Link>
                    )}
                  </div>
                </div>
              ) : (
                <p className="font-semibold text-slate-600">O&apos;qituvchi hali bugungi darsni belgilamadi. Istalgan darsni o&apos;qib chiqishingiz mumkin 🙂</p>
              )
            ) : (
              <p className="font-semibold text-slate-600">Siz hali guruhga qo&apos;shilmagansiz.</p>
            )}
          </div>
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-500">⭐ Mening yutuqlarim</p>
            <p className="mt-1 text-3xl font-black">{done} / {all.length}</p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${(done / all.length) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">test topshirilgan darslar</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {months.map((m) => {
          const mt = theme(m.num);
          return (
            <button
              key={m.num}
              onClick={() => setMonth(m.num)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black transition ${m.num === month ? `${mt.bg} text-white shadow` : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
            >
              {m.emoji} {m.num}-oy
            </button>
          );
        })}
      </div>

      <div className={`rounded-2xl bg-gradient-to-r ${t.grad} p-5 text-white`}>
        <h1 className="text-2xl font-black">{shownMonth.emoji} {shownMonth.num}-oy: {shownMonth.title}</h1>
        <p className="text-white/90">{shownMonth.summary}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {weeks.filter((w) => w.month === month).map((w) => (
          <div key={w.week} className="card p-4">
            <h3 className="mb-3 font-black">
              <span className={t.text}>{w.week}-hafta</span> · {w.title}
            </h3>
            <ul className="space-y-2">
              {w.lessons.map((l) => {
                const b = st.best(l.id);
                const s = st.status(l.id);
                return (
                  <li key={l.id}>
                    <Link
                      href={`/darslar/${l.id}`}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition hover:shadow ${st.current === l.id ? `border-2 ${t.border} ${t.soft}` : "border-slate-200"}`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${t.bg} text-sm font-black text-white`}>{l.num}</span>
                      <span className="flex-1 font-semibold leading-tight">
                        {l.title}
                        <span className="mt-1 flex flex-wrap gap-1">
                          {l.kind === "project" && <span className="chip bg-fuchsia-100 text-fuchsia-700">🛠️ Loyiha</span>}
                          {l.kind === "event" && <span className="chip bg-yellow-100 text-yellow-800">🎉 Tadbir</span>}
                          {l.visual && <span className="chip bg-sky-100 text-sky-700">🕹️ Interaktiv</span>}
                          {st.current === l.id && <span className="chip bg-indigo-100 text-indigo-700">📍 Bugun</span>}
                          {s?.test_open && <span className="chip bg-emerald-100 text-emerald-700">📝 Test ochiq</span>}
                        </span>
                      </span>
                      {b && (
                        <span className="chip bg-emerald-500 text-white">
                          {b.score}/{b.total}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
