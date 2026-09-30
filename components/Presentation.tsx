"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { months } from "@/content/months";
import type { PublicLesson } from "@/lib/catalog";
import { theme } from "@/lib/theme";
import { SlideCard, inline } from "./SlideCard";
import { Visual, visualTitles } from "./visuals";

type Frame =
  | { kind: "title" }
  | { kind: "slide"; i: number }
  | { kind: "visual" }
  | { kind: "list"; title: string; items: string[]; numbered?: boolean }
  | { kind: "end" };

export function Presentation({ lesson }: { lesson: PublicLesson }) {
  const t = theme(lesson.month);
  const month = months.find((m) => m.num === lesson.month)!;

  const frames = useMemo<Frame[]>(() => {
    const f: Frame[] = [{ kind: "title" }];
    lesson.slides.forEach((_, i) => f.push({ kind: "slide", i }));
    if (lesson.visual) f.push({ kind: "visual" });
    f.push({ kind: "list", title: "🛠️ Sinf ishi", items: lesson.practice, numbered: true });
    if (lesson.rubric) f.push({ kind: "list", title: "✅ Baholash mezonlari", items: lesson.rubric });
    f.push({ kind: "list", title: "🏠 Uy vazifasi", items: [lesson.homework] });
    f.push({ kind: "end" });
    return f;
  }, [lesson]);

  const [i, setI] = useState(0);
  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(frames.length - 1, x + d))), [frames.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
      if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const f = frames[i];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      <div className={`h-2 bg-gradient-to-r ${t.grad} transition-all`} style={{ width: `${((i + 1) / frames.length) * 100}%` }} />
      <div className="flex items-center justify-between px-6 py-3 text-sm font-bold text-slate-500">
        <span>{month.emoji} {lesson.num}-dars · {lesson.title}</span>
        <span className="flex items-center gap-3">
          <span className="hidden sm:inline">← → almashtirish · F — to&apos;liq ekran</span>
          <Link href={`/darslar/${lesson.id}`} className="btn-ghost py-1 text-sm">✕ Yopish</Link>
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-auto px-6 pb-4 sm:px-16">
        <div className="w-full max-w-6xl">
          {f.kind === "title" && (
            <div className={`rounded-[2rem] bg-gradient-to-br ${t.grad} p-10 text-white shadow-xl sm:p-16`}>
              <p className="text-2xl font-bold text-white/90">{month.num}-oy · {lesson.week}-hafta · {lesson.day}-kun</p>
              <h1 className="mt-4 text-5xl font-black leading-tight sm:text-7xl">{lesson.title}</h1>
              <ul className="mt-8 space-y-2 text-2xl sm:text-3xl">
                {lesson.goals.map((g, gi) => <li key={gi}>🎯 <span dangerouslySetInnerHTML={{ __html: inline(g) }} /></li>)}
              </ul>
            </div>
          )}
          {f.kind === "slide" && (
            <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:p-14">
              <SlideCard slide={lesson.slides[f.i]} big />
            </div>
          )}
          {f.kind === "visual" && lesson.visual && (
            <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-10">
              <h2 className="mb-6 text-4xl font-black">🕹️ {visualTitles[lesson.visual]}</h2>
              <Visual kind={lesson.visual} preset={lesson.visualPreset} />
            </div>
          )}
          {f.kind === "list" && (
            <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:p-14">
              <h2 className="mb-6 text-4xl font-black sm:text-6xl">{f.title}</h2>
              <ol className="space-y-3 text-2xl sm:text-3xl">
                {f.items.map((it, k) => (
                  <li key={k} className="flex gap-3">
                    <span className={`${t.text} font-black`}>{f.numbered ? `${k + 1}.` : "●"}</span>
                    <span dangerouslySetInnerHTML={{ __html: inline(it) }} />
                  </li>
                ))}
              </ol>
            </div>
          )}
          {f.kind === "end" && (
            <div className="text-center">
              <p className="text-8xl">🎉</p>
              <h2 className="mt-4 text-6xl font-black">Barakalla!</h2>
              <p className="mt-4 text-3xl text-slate-600">Endi testni topshirish vaqti — {lesson.quizCount} ta savol 📝</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <button className="btn-ghost text-lg" disabled={i === 0} onClick={() => go(-1)}>← Oldingi</button>
        <span className="font-black text-slate-500">{i + 1} / {frames.length}</span>
        <button className="btn-primary text-lg" disabled={i === frames.length - 1} onClick={() => go(1)}>Keyingi →</button>
      </div>
    </div>
  );
}
