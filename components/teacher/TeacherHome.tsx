"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { WeekMeta } from "@/lib/catalog";
import { store } from "@/lib/data";
import type { Group } from "@/lib/data/types";

interface GroupSummary {
  group: Group;
  students: number;
  currentTitle: string | null;
  currentId: string | null;
  openTests: number;
}

export function TeacherHome({ weeks }: { weeks: WeekMeta[] }) {
  const all = weeks.flatMap((w) => w.lessons);
  const [items, setItems] = useState<GroupSummary[] | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const groups = await store.teacherGroups();
    const out: GroupSummary[] = [];
    for (const g of groups) {
      const [students, gls] = await Promise.all([store.groupStudents(g.id), store.groupLessons(g.id)]);
      const cur = gls.find((x) => x.is_current);
      const l = all.find((x) => x.id === cur?.lesson_id);
      out.push({
        group: g,
        students: students.length,
        currentId: l?.id ?? null,
        currentTitle: l ? `${l.num}. ${l.title}` : null,
        openTests: gls.filter((x) => x.test_open).length,
      });
    }
    setItems(out);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    try {
      await store.createGroup(name);
      setName("");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">🧑‍🏫 O&apos;qituvchi paneli</h1>
          <p className="text-slate-600">Guruhlaringiz, bugungi darslar va test natijalari.</p>
        </div>
        <form onSubmit={create} className="flex gap-2">
          <input className="input" placeholder="Yangi guruh nomi (masalan: 3-guruh, dush/chor/jum 14:00)" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn-primary shrink-0">+ Guruh</button>
        </form>
      </div>
      {error && <p className="rounded-lg bg-rose-50 p-3 font-semibold text-rose-700">{error}</p>}

      {items === null ? (
        <p className="text-slate-500">Yuklanmoqda...</p>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-5xl">👥</p>
          <p className="mt-2 font-bold">Hali guruh yo&apos;q. Yuqorida birinchi guruhni yarating.</p>
          <p className="text-slate-500">Keyin guruh kodini o&apos;quvchilarga bering — ular shu kod bilan ro&apos;yxatdan o&apos;tadi.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.group.id} className="card space-y-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-black">{it.group.name}</h2>
                <span className="chip bg-slate-100 text-slate-700">👥 {it.students} o&apos;quvchi</span>
              </div>
              <div className="rounded-xl bg-indigo-50 p-3">
                <p className="text-xs font-bold uppercase text-indigo-500">Guruh kodi (o&apos;quvchilarga bering)</p>
                <p className="font-mono text-3xl font-black tracking-widest text-indigo-700">{it.group.join_code}</p>
              </div>
              <p className="text-sm">
                📍 Bugungi dars: {it.currentTitle ? <b>{it.currentTitle}</b> : <span className="text-slate-500">belgilanmagan</span>}
                {it.openTests > 0 && <span className="chip ml-2 bg-emerald-100 text-emerald-700">{it.openTests} ta test ochiq</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href={`/oqituvchi/guruh/${it.group.id}`} className="btn-primary">📊 Boshqarish va natijalar</Link>
                {it.currentId && <Link href={`/taqdimot/${it.currentId}`} className="btn-ghost">🖥️ Taqdimot</Link>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card bg-sky-50 p-5 text-sm text-sky-950">
        <p className="font-black">📖 Qanday ishlatiladi?</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Guruh yarating va guruh kodini o&apos;quvchilarga bering.</li>
          <li>Darsda: dars sahifasini oching → <b>📍 Bugungi dars qilish</b> → <b>🖥️ Taqdimot rejimi</b> (proyektor uchun, ← → tugmalar).</li>
          <li>Dars oxirida <b>🔓 Testni ochish</b> — o&apos;quvchilar o&apos;z kompyuter/telefonidan testni topshiradi.</li>
          <li>Natijalarni guruh sahifasida ko&apos;ring, kerak bo&apos;lsa CSV (Excel) faylga yuklab oling.</li>
        </ol>
      </div>
    </div>
  );
}
