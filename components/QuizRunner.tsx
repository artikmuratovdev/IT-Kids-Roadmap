"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicQuestion } from "@/content/types";
import type { LessonMeta } from "@/lib/catalog";
import { store, useAuth } from "@/lib/data";
import { useStudentState } from "@/lib/data/hooks";
import { gradeLabel, type GradeResult } from "@/lib/grading";
import { theme } from "@/lib/theme";
import { inline } from "./SlideCard";

const LETTERS = ["A", "B", "C", "D", "E"];

export function QuizRunner({ lesson, questions }: { lesson: LessonMeta; questions: PublicQuestion[] }) {
  const { user, loading } = useAuth();
  const st = useStudentState();
  const t = theme(lesson.month);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [idx, setIdx] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading || (user?.role === "student" && !st.loaded)) return <p className="text-slate-500">Yuklanmoqda...</p>;
  if (!user)
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="mb-3 font-semibold">Testni topshirish uchun tizimga kiring.</p>
        <Link href="/login" className="btn-primary">Kirish</Link>
      </div>
    );
  if (user.role === "student" && !st.status(lesson.id)?.test_open && !result)
    return (
      <div className="card mx-auto max-w-md p-6 text-center">
        <p className="text-5xl">🔒</p>
        <p className="mt-2 font-bold">Bu test hozir yopiq.</p>
        <p className="text-slate-500">O&apos;qituvchi ochishini kuting.</p>
        <Link href={`/darslar/${lesson.id}`} className="btn-ghost mt-4">← Darsga qaytish</Link>
      </div>
    );

  async function submit() {
    setBusy(true);
    setError("");
    try {
      setResult(await store.submitAttempt(lesson.id, answers));
      setIdx(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const answered = answers.filter((a) => a !== null).length;
  const q = questions[idx];

  if (result) {
    const label = gradeLabel(result.percent);
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className={`rounded-3xl bg-gradient-to-br ${t.grad} p-8 text-center text-white`}>
          <p className="text-6xl">{label.emoji}</p>
          <p className="mt-2 text-4xl font-black">{result.score} / {result.total}</p>
          <p className="text-xl font-bold">{label.text} ({result.percent}%)</p>
          {user.role === "teacher" && <p className="mt-2 text-sm text-white/80">O&apos;qituvchi sinovi — natija saqlanmadi</p>}
        </div>
        <h2 className="text-xl font-black">Javoblar tahlili</h2>
        {questions.map((qq, i) => {
          const r = result.review[i];
          return (
            <div key={i} className={`card border-l-4 p-4 ${r.ok ? "border-emerald-500" : "border-rose-500"}`}>
              <p className="font-bold">{r.ok ? "✅" : "❌"} {i + 1}. <span dangerouslySetInnerHTML={{ __html: inline(qq.q) }} /></p>
              {qq.code && <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-sm text-emerald-300">{qq.code}</pre>}
              <p className="mt-2 text-sm">
                To&apos;g&apos;ri javob: <b className="text-emerald-700">{qq.options[r.correct]}</b>
                {!r.ok && r.given !== null && (
                  <> · Sizning javobingiz: <b className="text-rose-700">{qq.options[r.given]}</b></>
                )}
                {r.given === null && <> · <b className="text-rose-700">javob berilmagan</b></>}
              </p>
              {r.explain && <p className="mt-1 text-sm text-slate-600">💡 {r.explain}</p>}
            </div>
          );
        })}
        <div className="flex gap-2">
          <Link href={`/darslar/${lesson.id}`} className="btn-ghost">← Darsga qaytish</Link>
          <button
            className="btn-primary"
            onClick={() => {
              setResult(null);
              setAnswers(questions.map(() => null));
              st.reload();
            }}
          >
            🔁 Qayta topshirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <Link href={`/darslar/${lesson.id}`} className="text-sm font-semibold text-slate-500 hover:text-indigo-600">← {lesson.num}. {lesson.title}</Link>
          <h1 className="text-2xl font-black">📝 Test</h1>
        </div>
        <span className="chip bg-slate-100 text-slate-700">{answered}/{questions.length} javob berildi</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-9 w-9 rounded-lg text-sm font-black ${i === idx ? `${t.bg} text-white` : answers[i] !== null ? "bg-emerald-100 text-emerald-700" : "bg-white ring-1 ring-slate-200"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="card p-6">
        <p className="text-sm font-bold text-slate-400">{idx + 1}-savol</p>
        <h2 className="mt-1 text-xl font-black" dangerouslySetInnerHTML={{ __html: inline(q.q) }} />
        {q.code && <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-sm text-emerald-300">{q.code}</pre>}
        <div className="mt-4 grid gap-2">
          {q.options.map((o, oi) => (
            <button
              key={oi}
              onClick={() => {
                const next = [...answers];
                next[idx] = oi;
                setAnswers(next);
              }}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left font-semibold transition ${answers[idx] === oi ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-black ${answers[idx] === oi ? "bg-indigo-500 text-white" : "bg-slate-100"}`}>{LETTERS[oi]}</span>
              {o}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-lg bg-rose-50 p-3 font-semibold text-rose-700">{error}</p>}

      <div className="flex justify-between gap-2">
        <button className="btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Oldingi</button>
        {idx < questions.length - 1 ? (
          <button className="btn-primary" onClick={() => setIdx(idx + 1)}>Keyingi →</button>
        ) : (
          <button className="btn-green" disabled={busy} onClick={submit}>
            {busy ? "Tekshirilmoqda..." : answered < questions.length ? `Topshirish (${questions.length - answered} ta javobsiz)` : "✅ Topshirish"}
          </button>
        )}
      </div>
    </div>
  );
}
