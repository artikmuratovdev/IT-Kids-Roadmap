"use client";

import { useEffect, useRef, useState } from "react";

const WORDS =
  "olma kitob maktab do'st quyosh daraxt kompyuter sichqoncha klaviatura ekran dastur o'yin rasm musiqa video bola qalam daftar sinf ustoz vatan bahor yoz kuz qish suv non gul qush baliq mushuk kuchuk ot tog' dengiz daryo osmon yulduz oy shahar uy eshik deraza stol stul futbol yugur sakra yoz o'qi chiz kul tez sekin katta kichik yangi chiroyli aqlli".split(" ");

const DURATIONS = [30, 60];

function makeText(n = 60) {
  return Array.from({ length: n }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(" ");
}

export default function TypingTest() {
  const [duration, setDuration] = useState(30);
  const [text, setText] = useState(() => makeText());
  const [typed, setTyped] = useState("");
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [best, setBest] = useState<number>(0);
  const input = useRef<HTMLInputElement>(null);

  const elapsed = started ? (now - started) / 1000 : 0;
  const left = Math.max(0, duration - elapsed);
  const done = started !== null && left <= 0;

  useEffect(() => {
    if (!started || done) return;
    const h = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(h);
  }, [started, done]);

  let correctChars = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === text[i]) correctChars++;
  const minutes = Math.max(elapsed, 1) / 60;
  const wpm = Math.round(correctChars / 5 / minutes);
  const acc = typed.length ? Math.round((correctChars / typed.length) * 100) : 100;

  useEffect(() => {
    if (done) {
      setBest((b) => Math.max(b, wpm));
    }
  }, [done, wpm]);

  function reset(d = duration) {
    setDuration(d);
    setText(makeText());
    setTyped("");
    setStarted(null);
    setTimeout(() => input.current?.focus(), 0);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {DURATIONS.map((d) => (
          <button key={d} onClick={() => reset(d)} className={`chip py-1.5 ${duration === d ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>{d} soniya</button>
        ))}
        <button className="chip bg-slate-100 py-1.5" onClick={() => reset()}>🔄 Yangi matn</button>
        <span className="ml-auto text-sm font-bold">🏆 Eng yaxshi: {best} so&apos;z/daq</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-indigo-50 p-3"><p className="text-3xl font-black text-indigo-700">{Math.ceil(left)}</p><p className="text-xs">soniya qoldi</p></div>
        <div className="rounded-xl bg-emerald-50 p-3"><p className="text-3xl font-black text-emerald-700">{started ? wpm : 0}</p><p className="text-xs">so&apos;z / daqiqa</p></div>
        <div className="rounded-xl bg-amber-50 p-3"><p className="text-3xl font-black text-amber-700">{acc}%</p><p className="text-xs">aniqlik</p></div>
      </div>
      <div
        className="relative cursor-text rounded-2xl bg-slate-900 p-5 font-mono text-xl leading-relaxed tracking-wide"
        onClick={() => input.current?.focus()}
      >
        {text.slice(0, 260).split("").map((ch, i) => {
          const cls = i < typed.length ? (typed[i] === ch ? "text-emerald-300" : "bg-rose-500/40 text-rose-300") : i === typed.length ? "border-l-2 border-amber-300 text-slate-400" : "text-slate-500";
          return <span key={i} className={cls}>{ch}</span>;
        })}
        {done && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-slate-900/90 text-center text-white">
            <div>
              <p className="text-5xl">{wpm >= 30 ? "🚀" : wpm >= 15 ? "👏" : "🐢"}</p>
              <p className="text-3xl font-black">{wpm} so&apos;z/daqiqa · {acc}%</p>
              <button className="btn-primary mt-3" onClick={() => reset()}>Yana bir marta</button>
            </div>
          </div>
        )}
      </div>
      <input
        ref={input}
        className="input font-mono"
        placeholder="Shu yerga yozishni boshlang — vaqt birinchi harfdan boshlanadi"
        value={typed}
        disabled={done}
        onChange={(e) => {
          if (!started) { setStarted(Date.now()); setNow(Date.now()); }
          setTyped(e.target.value);
        }}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <p className="text-sm text-slate-500">💡 Barmoqlar: chap ko&apos;rsatkich — F, o&apos;ng ko&apos;rsatkich — J (bu tugmalarda kichik bo&apos;rtiq bor). Klaviaturaga emas, ekranga qarab yozing!</p>
    </div>
  );
}
