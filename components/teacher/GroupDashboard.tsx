"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { months } from "@/content/months";
import type { WeekMeta } from "@/lib/catalog";
import { store } from "@/lib/data";
import type { Attempt, Group, GroupLesson, Profile } from "@/lib/data/types";
import { theme } from "@/lib/theme";

function cellColor(p: number) {
  if (p >= 85) return "bg-emerald-500 text-white";
  if (p >= 60) return "bg-amber-300 text-amber-950";
  return "bg-rose-400 text-white";
}

export function GroupDashboard({ groupId, weeks }: { groupId: string; weeks: WeekMeta[] }) {
  const all = useMemo(() => weeks.flatMap((w) => w.lessons), [weeks]);
  const [group, setGroup] = useState<Group | null | undefined>(undefined);
  const [students, setStudents] = useState<Profile[]>([]);
  const [gls, setGls] = useState<GroupLesson[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [month, setMonth] = useState(1);
  const [tab, setTab] = useState<"control" | "results">("control");

  const load = useCallback(async () => {
    const groups = await store.teacherGroups();
    const g = groups.find((x) => x.id === groupId) ?? null;
    setGroup(g);
    if (!g) return;
    const [s, l, a] = await Promise.all([store.groupStudents(g.id), store.groupLessons(g.id), store.groupAttempts(g.id)]);
    setStudents(s);
    setGls(l);
    setAttempts(a);
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const cur = all.find((l) => l.id === gls.find((g) => g.is_current)?.lesson_id);
    if (cur) setMonth(cur.month);
    // faqat birinchi yuklashda joriy oyga o'tish
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gls.length > 0]);

  if (group === undefined) return <p className="text-slate-500">Yuklanmoqda...</p>;
  if (group === null) return <p className="card p-6">Guruh topilmadi yoki sizga tegishli emas.</p>;

  const status = (id: string) => gls.find((g) => g.lesson_id === id);
  const best = (sid: string, lid: string) => {
    const xs = attempts.filter((a) => a.student_id === sid && a.lesson_id === lid);
    if (!xs.length) return null;
    return xs.reduce((b, a) => (a.score / a.total > b.score / b.total ? a : b));
  };
  const monthLessons = all.filter((l) => l.month === month);
  const attemptedLessons = all.filter((l) => attempts.some((a) => a.lesson_id === l.id));
  const t = theme(month);

  async function makeCurrent(id: string) {
    await store.setCurrentLesson(group!.id, id);
    await load();
  }
  async function toggle(id: string) {
    await store.setTestOpen(group!.id, id, !status(id)?.test_open);
    await load();
  }

  function exportCsv() {
    const header = ["O'quvchi", "Login", ...attemptedLessons.map((l) => `${l.num}. ${l.title}`), "O'rtacha %"];
    const rows = students.map((s) => {
      const cells = attemptedLessons.map((l) => {
        const b = best(s.id, l.id);
        return b ? `${b.score}/${b.total}` : "";
      });
      const ps = attemptedLessons.map((l) => best(s.id, l.id)).filter(Boolean).map((b) => (b!.score / b!.total) * 100);
      const avg = ps.length ? Math.round(ps.reduce((x, y) => x + y, 0) / ps.length) : "";
      return [s.full_name, s.username, ...cells, String(avg)];
    });
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${group!.name}-natijalar.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/oqituvchi" className="text-sm font-semibold text-slate-500 hover:text-indigo-600">← O&apos;qituvchi paneli</Link>
          <h1 className="text-3xl font-black">{group.name}</h1>
          <p className="text-slate-600">
            Guruh kodi: <b className="font-mono text-indigo-700">{group.join_code}</b> · {students.length} o&apos;quvchi
          </p>
        </div>
        <div className="flex gap-2">
          <button className={tab === "control" ? "btn-primary" : "btn-ghost"} onClick={() => setTab("control")}>🎛️ Darslarni boshqarish</button>
          <button className={tab === "results" ? "btn-primary" : "btn-ghost"} onClick={() => setTab("results")}>📊 Natijalar</button>
          <button className="btn-ghost" onClick={load} title="Yangilash">🔄</button>
        </div>
      </div>

      {tab === "control" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {months.map((m) => (
              <button
                key={m.num}
                onClick={() => setMonth(m.num)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black ${m.num === month ? `${theme(m.num).bg} text-white` : "bg-white ring-1 ring-slate-200"}`}
              >
                {m.emoji} {m.num}-oy
              </button>
            ))}
          </div>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={`${t.soft} text-left`}>
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Dars</th>
                  <th className="p-3">Topshirganlar</th>
                  <th className="p-3 text-right">Boshqaruv</th>
                </tr>
              </thead>
              <tbody>
                {monthLessons.map((l) => {
                  const s = status(l.id);
                  const takers = new Set(attempts.filter((a) => a.lesson_id === l.id).map((a) => a.student_id)).size;
                  return (
                    <tr key={l.id} className={`border-t border-slate-100 ${s?.is_current ? "bg-indigo-50" : ""}`}>
                      <td className="p-3 font-black text-slate-400">{l.num}</td>
                      <td className="p-3">
                        <Link href={`/darslar/${l.id}`} className="font-bold hover:text-indigo-600">{l.title}</Link>
                        <div className="text-xs text-slate-500">{l.week}-hafta · {l.day}-kun</div>
                      </td>
                      <td className="p-3">{takers} / {students.length}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <button className={`btn px-3 py-1 text-xs ${s?.is_current ? "bg-indigo-600 text-white" : "bg-white ring-1 ring-slate-300"}`} onClick={() => makeCurrent(l.id)}>
                            📍 {s?.is_current ? "Bugun" : "Bugun qilish"}
                          </button>
                          <button className={`btn px-3 py-1 text-xs ${s?.test_open ? "bg-emerald-500 text-white" : "bg-white ring-1 ring-slate-300"}`} onClick={() => toggle(l.id)}>
                            {s?.test_open ? "🔓 Test ochiq" : "🔒 Test yopiq"}
                          </button>
                          <Link href={`/taqdimot/${l.id}`} className="btn bg-white px-3 py-1 text-xs ring-1 ring-slate-300">🖥️</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "results" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">Har katakda o&apos;quvchining eng yaxshi natijasi. 🟩 85%+ · 🟨 60%+ · 🟥 60% dan past</p>
            <button className="btn-ghost" onClick={exportCsv} disabled={!students.length}>⬇️ CSV (Excel) yuklab olish</button>
          </div>
          {attemptedLessons.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">Hali hech kim test topshirmagan.</div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="sticky left-0 bg-slate-50 p-3 text-left">O&apos;quvchi</th>
                    {attemptedLessons.map((l) => (
                      <th key={l.id} className="p-2 text-center" title={l.title}>
                        <Link href={`/darslar/${l.id}`} className="font-black hover:text-indigo-600">{l.num}</Link>
                      </th>
                    ))}
                    <th className="p-3">O&apos;rtacha</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const ps: number[] = [];
                    return (
                      <tr key={s.id} className="border-t border-slate-100">
                        <td className="sticky left-0 bg-white p-3 font-bold whitespace-nowrap">{s.full_name}</td>
                        {attemptedLessons.map((l) => {
                          const b = best(s.id, l.id);
                          if (!b) return <td key={l.id} className="p-1 text-center text-slate-300">—</td>;
                          const p = Math.round((b.score / b.total) * 100);
                          ps.push(p);
                          return (
                            <td key={l.id} className="p-1 text-center">
                              <span className={`inline-block min-w-12 rounded-lg px-2 py-1 font-black ${cellColor(p)}`}>{b.score}/{b.total}</span>
                            </td>
                          );
                        })}
                        <td className="p-3 text-center font-black">{ps.length ? `${Math.round(ps.reduce((a, b) => a + b, 0) / ps.length)}%` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
