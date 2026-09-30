"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { months } from "@/content/months";
import type { LessonMeta, PublicLesson } from "@/lib/catalog";
import { useAuth } from "@/lib/data";
import { useStudentState } from "@/lib/data/hooks";
import { theme } from "@/lib/theme";
import { SlideCard, inline } from "./SlideCard";
import { TeacherLessonControls } from "./TeacherLessonControls";
import { Visual, visualTitles } from "./visuals";

export function LessonView({ lesson, prev, next }: { lesson: PublicLesson; prev?: LessonMeta; next?: LessonMeta }) {
  const { user } = useAuth();
  const st = useStudentState();
  const t = theme(lesson.month);
  const month = months.find((m) => m.num === lesson.month)!;
  const [slide, setSlide] = useState(0);
  const [checked, setChecked] = useState<boolean[]>([]);
  const checkKey = `itkids-practice-${lesson.id}`;

  useEffect(() => {
    try {
      setChecked(JSON.parse(localStorage.getItem(checkKey) ?? "[]"));
    } catch {
      setChecked([]);
    }
  }, [checkKey]);

  function toggle(i: number) {
    const nextChecked = [...checked];
    nextChecked[i] = !nextChecked[i];
    setChecked(nextChecked);
    try {
      localStorage.setItem(checkKey, JSON.stringify(nextChecked));
    } catch {
      /* e'tiborsiz */
    }
  }

  const best = st.best(lesson.id);
  const testOpen = st.status(lesson.id)?.test_open;

  return (
    <article className="space-y-6">
      <nav className="text-sm font-semibold text-slate-500">
        <Link href="/darslar" className="hover:text-indigo-600">Darslar</Link> › {month.emoji} {month.num}-oy › {lesson.week}-hafta
      </nav>

      <header className={`rounded-3xl bg-gradient-to-br ${t.grad} p-6 text-white shadow sm:p-8`}>
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-white/90">
          <span className="chip bg-white/20">{lesson.num}-dars</span>
          <span className="chip bg-white/20">{lesson.week}-hafta · {lesson.day}-kun</span>
          <span className="chip bg-white/20">⏱ 80 daqiqa</span>
          {lesson.kind === "project" && <span className="chip bg-white/30">🛠️ Mini loyiha</span>}
          {lesson.kind === "event" && <span className="chip bg-white/30">🎉 Tadbir</span>}
        </div>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{lesson.title}</h1>
        <ul className="mt-4 grid gap-1 sm:grid-cols-2">
          {lesson.goals.map((g, i) => (
            <li key={i} className="flex gap-2 text-white/95">🎯 <span dangerouslySetInnerHTML={{ __html: inline(g) }} /></li>
          ))}
        </ul>
      </header>

      {user?.role === "teacher" && <TeacherLessonControls lessonId={lesson.id} />}

      {/* Tushunchalar — slaydlar */}
      <section className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black">💡 Tushunchalar</h2>
          <div className="flex items-center gap-1">
            {lesson.slides.map((_, i) => (
              <button
                key={i}
                aria-label={`${i + 1}-slayd`}
                onClick={() => setSlide(i)}
                className={`h-3 rounded-full transition-all ${i === slide ? `w-8 ${t.bg}` : "w-3 bg-slate-200 hover:bg-slate-300"}`}
              />
            ))}
          </div>
        </div>
        <div className={`min-h-56 rounded-2xl border ${t.border} ${t.soft} p-5 sm:p-7`}>
          <SlideCard slide={lesson.slides[slide]} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button className="btn-ghost" disabled={slide === 0} onClick={() => setSlide(slide - 1)}>← Oldingi</button>
          <span className="text-sm font-bold text-slate-500">{slide + 1} / {lesson.slides.length}</span>
          <button className="btn-primary" disabled={slide === lesson.slides.length - 1} onClick={() => setSlide(slide + 1)}>Keyingi →</button>
        </div>
      </section>

      {lesson.visual && (
        <section className="card p-5">
          <h2 className="mb-4 text-xl font-black">🕹️ {visualTitles[lesson.visual]}</h2>
          <Visual kind={lesson.visual} preset={lesson.visualPreset} />
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 text-xl font-black">🛠️ Sinf ishi</h2>
          <ol className="space-y-2">
            {lesson.practice.map((p, i) => (
              <li key={i}>
                <label className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${checked[i] ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-emerald-500" checked={!!checked[i]} onChange={() => toggle(i)} />
                  <span className={checked[i] ? "text-slate-500 line-through" : ""}>
                    <b className="mr-1">{i + 1}.</b>
                    <span dangerouslySetInnerHTML={{ __html: inline(p) }} />
                  </span>
                </label>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="mb-3 text-xl font-black">🏠 Uy vazifasi</h2>
            <p className="rounded-xl bg-sky-50 p-4 text-sky-950" dangerouslySetInnerHTML={{ __html: inline(lesson.homework) }} />
          </section>

          {lesson.rubric && (
            <section className="card p-5">
              <h2 className="mb-3 text-xl font-black">✅ Baholash mezonlari</h2>
              <ul className="space-y-1.5">
                {lesson.rubric.map((r, i) => (
                  <li key={i} className="flex gap-2">⭐ <span>{r}</span></li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <h2 className="mb-2 text-xl font-black">📝 Test ({lesson.quizCount} ta savol)</h2>
            {user?.role === "student" ? (
              <>
                {best && (
                  <p className="mb-2 font-semibold text-emerald-700">
                    Eng yaxshi natijangiz: {best.score}/{best.total}
                  </p>
                )}
                {testOpen ? (
                  <Link href={`/darslar/${lesson.id}/test`} className="btn-green">Testni boshlash →</Link>
                ) : (
                  <p className="text-slate-500">🔒 Test hozircha yopiq. O&apos;qituvchi ochganda shu yerda tugma paydo bo&apos;ladi.</p>
                )}
              </>
            ) : user?.role === "teacher" ? (
              <Link href={`/darslar/${lesson.id}/test`} className="btn-ghost">Testni ko&apos;rib chiqish (natija saqlanmaydi)</Link>
            ) : (
              <p className="text-slate-500">
                Testni topshirish uchun <Link href="/login" className="font-bold text-indigo-600">tizimga kiring</Link>.
              </p>
            )}
          </section>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {prev ? <Link href={`/darslar/${prev.id}`} className="btn-ghost">← {prev.num}. {prev.title}</Link> : <span />}
        {next && <Link href={`/darslar/${next.id}`} className="btn-ghost">{next.num}. {next.title} →</Link>}
      </div>
    </article>
  );
}
