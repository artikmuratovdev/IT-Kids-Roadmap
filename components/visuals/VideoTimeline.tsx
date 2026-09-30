"use client";

import { useEffect, useRef, useState } from "react";

interface Clip { id: number; name: string; emoji: string; color: string; len: number }
interface TextItem { id: number; text: string; start: number; len: number }

const LIBRARY: Omit<Clip, "id">[] = [
  { name: "Tog'lar", emoji: "🏔️", color: "#60a5fa", len: 12 },
  { name: "Mushuk", emoji: "🐱", color: "#f59e0b", len: 8 },
  { name: "Futbol", emoji: "⚽", color: "#22c55e", len: 15 },
  { name: "Tort", emoji: "🎂", color: "#ec4899", len: 10 },
  { name: "Dengiz", emoji: "🌊", color: "#0ea5e9", len: 14 },
  { name: "Raketa", emoji: "🚀", color: "#8b5cf6", len: 9 },
];
const MUSIC = ["🎵 Quvnoq", "🎹 Sokin", "🥁 Energik"];
const PX = 12; // 1 soniya = 12px

export default function VideoTimeline() {
  const [clips, setClips] = useState<Clip[]>([
    { id: 1, ...LIBRARY[0] },
    { id: 2, ...LIBRARY[1] },
  ]);
  const [texts, setTexts] = useState<TextItem[]>([{ id: 1, text: "Mening sayohatim", start: 0, len: 5 }]);
  const [music, setMusic] = useState<string | null>(null);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selClip, setSelClip] = useState<number | null>(null);
  const nextId = useRef(10);
  const total = clips.reduce((s, c) => s + c.len, 0);

  useEffect(() => {
    if (!playing) return;
    const h = setInterval(() => {
      setT((x) => {
        if (x + 0.1 >= total) { setPlaying(false); return total; }
        return Math.round((x + 0.1) * 10) / 10;
      });
    }, 100);
    return () => clearInterval(h);
  }, [playing, total]);

  let acc = 0;
  const at = clips.map((c) => { const s = acc; acc += c.len; return { ...c, start: s }; });
  const current = at.find((c) => t >= c.start && t < c.start + c.len) ?? at[at.length - 1];
  const curText = texts.find((x) => t >= x.start && t < x.start + x.len);

  function split() {
    const c = at.find((x) => t > x.start && t < x.start + x.len);
    if (!c) return;
    const a = Math.round((t - c.start) * 10) / 10;
    const i = clips.findIndex((x) => x.id === c.id);
    const left = { ...clips[i], len: a };
    const right = { ...clips[i], id: nextId.current++, len: Math.round((clips[i].len - a) * 10) / 10 };
    setClips([...clips.slice(0, i), left, right, ...clips.slice(i + 1)]);
  }

  function remove() {
    if (selClip === null) return;
    setClips(clips.filter((c) => c.id !== selClip));
    setSelClip(null);
    setT(0);
  }

  function addText() {
    const text = prompt("Qanday matn qo'shamiz?", "Salom!");
    if (text) setTexts([...texts, { id: nextId.current++, text, start: Math.floor(t), len: 4 }]);
  }

  const mm = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="space-y-3 rounded-2xl bg-slate-900 p-4 text-white">
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-xl text-8xl transition-colors" style={{ background: current?.color ?? "#1e293b" }}>
          {current ? current.emoji : "🎬"}
          {curText && <div className="absolute bottom-6 rounded-lg bg-black/60 px-4 py-1 text-2xl font-black">{curText.text}</div>}
          {music && playing && <div className="absolute right-3 top-3 animate-pulse text-sm">{music}</div>}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold text-slate-300">📂 Media kutubxona (bosing — qo&apos;shiladi)</p>
          <div className="grid grid-cols-3 gap-2">
            {LIBRARY.map((c) => (
              <button key={c.name} onClick={() => setClips([...clips, { ...c, id: nextId.current++ }])} className="rounded-lg p-2 text-center text-xs font-bold" style={{ background: c.color }}>
                <span className="block text-2xl">{c.emoji}</span>{c.name} · {c.len}s
              </button>
            ))}
          </div>
          <p className="pt-2 text-sm font-bold text-slate-300">🎵 Musiqa</p>
          <div className="flex flex-wrap gap-1">
            {MUSIC.map((m) => (
              <button key={m} onClick={() => setMusic(music === m ? null : m)} className={`chip py-1 ${music === m ? "bg-emerald-500" : "bg-slate-700"}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn bg-white px-3 py-1 text-slate-900" onClick={() => { if (t >= total) setT(0); setPlaying(!playing); }}>{playing ? "⏸ Pauza" : "▶️ Ijro"}</button>
        <button className="btn bg-slate-700 px-3 py-1" onClick={split}>✂️ Kesish (Split)</button>
        <button className="btn bg-slate-700 px-3 py-1" onClick={remove} disabled={selClip === null}>🗑️ Klipni o&apos;chirish</button>
        <button className="btn bg-slate-700 px-3 py-1" onClick={addText}>🔤 Matn qo&apos;shish</button>
        <span className="ml-auto font-mono text-sm">{mm(t)} / {mm(total)}</span>
        <span className={`chip ${total <= 60 ? "bg-emerald-500" : "bg-rose-500"}`}>{total <= 60 ? "✅ 1 daqiqagacha" : "⚠️ 1 daqiqadan uzun"}</span>
      </div>

      <div className="overflow-x-auto rounded-xl bg-slate-800 p-2">
        <div
          className="relative space-y-1.5"
          style={{ width: Math.max(total * PX + 40, 600) }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setT(Math.max(0, Math.min(total, Math.round(((e.clientX - r.left) / PX) * 10) / 10)));
          }}
        >
          <div className="flex h-4 text-[10px] text-slate-400">
            {Array.from({ length: Math.ceil(total / 5) + 1 }, (_, i) => (
              <span key={i} style={{ width: 5 * PX }} className="shrink-0 border-l border-slate-600 pl-0.5">{i * 5}s</span>
            ))}
          </div>
          <div className="flex h-12">
            {at.map((c) => (
              <button
                key={c.id}
                onClick={(e) => { e.stopPropagation(); setSelClip(c.id); setT(c.start); }}
                className={`shrink-0 overflow-hidden rounded-md border-2 text-left text-xs font-bold ${selClip === c.id ? "border-white" : "border-transparent"}`}
                style={{ width: c.len * PX, background: c.color }}
              >
                <span className="px-1">{c.emoji} {c.len}s</span>
              </button>
            ))}
          </div>
          <div className="relative h-7">
            {texts.map((x) => (
              <div key={x.id} className="absolute h-7 truncate rounded-md bg-amber-400 px-1 text-xs font-bold leading-7 text-amber-950" style={{ left: x.start * PX, width: x.len * PX }}>
                T {x.text}
              </div>
            ))}
          </div>
          <div className="h-6 rounded-md text-xs font-bold leading-6" style={{ width: music ? total * PX : 0, background: "#10b981" }}>
            {music && <span className="px-1">{music}</span>}
          </div>
          <div className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-rose-500" style={{ left: t * PX }} />
        </div>
      </div>
      <p className="text-xs text-slate-400">💡 Vaqt chizig&apos;iga bosib qizil chiziqni (playhead) qo&apos;ying, ✂️ bilan klipni ikkiga bo&apos;ling va keraksiz qismni o&apos;chiring. CapCut&apos;da ham xuddi shunday!</p>
    </div>
  );
}
