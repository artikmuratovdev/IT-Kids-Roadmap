"use client";

import Link from "next/link";
import { useTeacherState } from "@/lib/data/hooks";

export function TeacherLessonControls({ lessonId }: { lessonId: string }) {
  const t = useTeacherState();
  const s = t.status(lessonId);
  return (
    <div className="card border-l-4 border-indigo-500 p-4">
      <p className="mb-2 text-sm font-black text-indigo-700">🧑‍🏫 O&apos;qituvchi boshqaruvi</p>
      {t.groups.length === 0 ? (
        <p className="text-sm">
          Avval <Link href="/oqituvchi" className="font-bold text-indigo-600">guruh yarating</Link>.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={t.groupId ?? ""} onChange={(e) => t.setGroupId(e.target.value)}>
            {t.groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <button className={s?.is_current ? "btn-ghost" : "btn-primary"} onClick={() => t.makeCurrent(lessonId)} disabled={s?.is_current}>
            {s?.is_current ? "📍 Bugungi dars" : "📍 Bugungi dars qilish"}
          </button>
          <button className={s?.test_open ? "btn-red" : "btn-green"} onClick={() => t.toggleTest(lessonId)}>
            {s?.test_open ? "🔒 Testni yopish" : "🔓 Testni ochish"}
          </button>
          <Link href={`/taqdimot/${lessonId}`} className="btn-ghost">🖥️ Taqdimot rejimi</Link>
          {t.groupId && <Link href={`/oqituvchi/guruh/${t.groupId}`} className="btn-ghost">📊 Natijalar</Link>}
        </div>
      )}
    </div>
  );
}
