"use client";

import { useState } from "react";

interface Part {
  id: string;
  name: string;
  emoji: string;
  kind: "Kiritish" | "Chiqarish" | "Ichki qism" | "Xotira";
  text: string;
  analogy: string;
}

const PARTS: Part[] = [
  { id: "monitor", name: "Monitor", emoji: "🖥️", kind: "Chiqarish", text: "Kompyuter bajargan ishni rasm va matn ko'rinishida ko'rsatadi.", analogy: "Kompyuterning yuzi — u nima o'ylayotganini ko'rsatadi." },
  { id: "keyboard", name: "Klaviatura", emoji: "⌨️", kind: "Kiritish", text: "Harf, raqam va buyruqlarni kiritish uchun. Enter, Space, Shift, Ctrl — eng muhim tugmalar.", analogy: "Kompyuterga xat yozadigan qalam." },
  { id: "mouse", name: "Sichqoncha", emoji: "🖱️", kind: "Kiritish", text: "Ekrandagi kursorni boshqaradi. Chap tugma — tanlash, o'ng tugma — qo'shimcha menyu, g'ildirak — aylantirish.", analogy: "Ekrandagi barmog'ingiz." },
  { id: "cpu", name: "Protsessor (CPU)", emoji: "🧠", kind: "Ichki qism", text: "Barcha hisob-kitob va buyruqlarni bajaradi. Tezligi GHz (gigagers) da o'lchanadi.", analogy: "Kompyuterning miyasi." },
  { id: "ram", name: "Operativ xotira (RAM)", emoji: "🧩", kind: "Xotira", text: "Hozir ishlayotgan dasturlarni vaqtincha saqlaydi. Kompyuter o'chsa — tozalanadi. Hajmi GB da.", analogy: "Ish stoli — ustida hozir kerakli narsalar turadi." },
  { id: "ssd", name: "HDD / SSD", emoji: "💾", kind: "Xotira", text: "Fayllar, rasm, o'yinlar doimiy saqlanadigan joy. SSD — tezroq, HDD — arzonroq va sekinroq.", analogy: "Katta shkaf — hamma narsa uzoq saqlanadi." },
  { id: "gpu", name: "Videokarta (GPU)", emoji: "🎮", kind: "Ichki qism", text: "Rasm, video va o'yinlarni monitorga chizib beradi.", analogy: "Kompyuterning rassomi." },
  { id: "mb", name: "Ona plata", emoji: "🟩", kind: "Ichki qism", text: "Barcha qismlarni bir-biriga ulaydigan katta plata.", analogy: "Shahar yo'llari — hamma qism shu orqali gaplashadi." },
  { id: "psu", name: "Quvvat bloki", emoji: "🔌", kind: "Ichki qism", text: "Rozetkadagi tokni kompyuter qismlari uchun mos tokka aylantiradi.", analogy: "Kompyuterning yuragi — hammaga energiya beradi." },
];

export default function ComputerParts() {
  const [sel, setSel] = useState<Part>(PARTS[0]);
  const [quiz, setQuiz] = useState<{ target: Part; score: number; msg: string } | null>(null);

  function click(id: string) {
    const p = PARTS.find((x) => x.id === id)!;
    setSel(p);
    if (quiz) {
      if (p.id === quiz.target.id) {
        const next = PARTS[Math.floor(Math.random() * PARTS.length)];
        setQuiz({ target: next, score: quiz.score + 1, msg: `✅ To'g'ri! Bu — ${p.name}` });
      } else setQuiz({ ...quiz, msg: `❌ Bu ${p.name}. Yana urinib ko'ring!` });
    }
  }

  const hl = (id: string) => (sel.id === id ? "#6366f1" : "#94a3b8");
  const fill = (id: string, base: string) => (sel.id === id ? "#c7d2fe" : base);
  const g = (id: string) => ({ onClick: () => click(id), style: { cursor: "pointer" }, role: "button", "aria-label": PARTS.find((p) => p.id === id)!.name });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <svg viewBox="0 0 640 380" className="w-full rounded-2xl bg-gradient-to-b from-sky-50 to-white ring-1 ring-slate-200">
        {/* Monitor */}
        <g {...g("monitor")}>
          <rect x="30" y="30" width="280" height="180" rx="12" fill={fill("monitor", "#1e293b")} stroke={hl("monitor")} strokeWidth="4" />
          <rect x="45" y="45" width="250" height="150" rx="6" fill="#38bdf8" />
          <text x="170" y="128" textAnchor="middle" fontSize="28" fill="white" fontWeight="bold">IT Kids</text>
          <rect x="150" y="210" width="40" height="30" fill="#475569" />
          <rect x="110" y="238" width="120" height="10" rx="5" fill="#475569" />
        </g>
        {/* Klaviatura */}
        <g {...g("keyboard")}>
          <rect x="30" y="280" width="260" height="70" rx="10" fill={fill("keyboard", "#e2e8f0")} stroke={hl("keyboard")} strokeWidth="4" />
          {Array.from({ length: 30 }).map((_, i) => (
            <rect key={i} x={42 + (i % 10) * 24.5} y={290 + Math.floor(i / 10) * 18} width="20" height="14" rx="3" fill="#94a3b8" />
          ))}
        </g>
        {/* Sichqoncha */}
        <g {...g("mouse")}>
          <ellipse cx="330" cy="315" rx="22" ry="34" fill={fill("mouse", "#e2e8f0")} stroke={hl("mouse")} strokeWidth="4" />
          <line x1="330" y1="283" x2="330" y2="310" stroke="#94a3b8" strokeWidth="3" />
        </g>
        {/* Tizim bloki (ochiq) */}
        <rect x="380" y="30" width="230" height="320" rx="14" fill="#f1f5f9" stroke="#64748b" strokeWidth="4" />
        <text x="495" y="22" textAnchor="middle" fontSize="13" fill="#475569" fontWeight="bold">Tizim bloki (ichi)</text>
        <g {...g("mb")}>
          <rect x="395" y="45" width="200" height="200" rx="8" fill={fill("mb", "#bbf7d0")} stroke={hl("mb")} strokeWidth="3" />
        </g>
        <g {...g("cpu")}>
          <rect x="420" y="65" width="60" height="60" rx="6" fill={fill("cpu", "#cbd5e1")} stroke={hl("cpu")} strokeWidth="4" />
          <text x="450" y="101" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#334155">CPU</text>
        </g>
        <g {...g("ram")}>
          <rect x="500" y="60" width="12" height="80" fill={fill("ram", "#1d4ed8")} stroke={hl("ram")} strokeWidth="3" />
          <rect x="520" y="60" width="12" height="80" fill={fill("ram", "#1d4ed8")} stroke={hl("ram")} strokeWidth="3" />
          <text x="516" y="155" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">RAM</text>
        </g>
        <g {...g("gpu")}>
          <rect x="410" y="170" width="160" height="40" rx="6" fill={fill("gpu", "#334155")} stroke={hl("gpu")} strokeWidth="4" />
          <circle cx="450" cy="190" r="13" fill="#64748b" />
          <circle cx="530" cy="190" r="13" fill="#64748b" />
          <text x="490" y="195" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">GPU</text>
        </g>
        <g {...g("ssd")}>
          <rect x="400" y="260" width="90" height="75" rx="6" fill={fill("ssd", "#fde68a")} stroke={hl("ssd")} strokeWidth="4" />
          <text x="445" y="303" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350f">SSD</text>
        </g>
        <g {...g("psu")}>
          <rect x="505" y="260" width="90" height="75" rx="6" fill={fill("psu", "#9ca3af")} stroke={hl("psu")} strokeWidth="4" />
          <text x="550" y="303" textAnchor="middle" fontSize="20">⚡</text>
        </g>
      </svg>

      <div className="space-y-3">
        <div className="rounded-2xl bg-indigo-50 p-5 ring-1 ring-indigo-100">
          <p className="text-4xl">{sel.emoji}</p>
          <h4 className="mt-1 text-2xl font-black">{sel.name}</h4>
          <span className="chip mt-1 bg-indigo-200 text-indigo-800">{sel.kind} qurilma</span>
          <p className="mt-3">{sel.text}</p>
          <p className="mt-2 font-semibold text-indigo-700">🤔 {sel.analogy}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PARTS.map((p) => (
            <button key={p.id} onClick={() => click(p.id)} className={`chip py-1 ${sel.id === p.id ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>
              {p.emoji} {p.name}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
          {quiz ? (
            <>
              <p className="font-black">🎯 Rasmda toping: <span className="text-amber-700">{quiz.target.name}</span></p>
              <p className="text-sm">Ball: {quiz.score} {quiz.msg && `· ${quiz.msg}`}</p>
              <button className="btn-ghost mt-2 text-sm" onClick={() => setQuiz(null)}>O&apos;yinni tugatish</button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setQuiz({ target: PARTS[Math.floor(Math.random() * PARTS.length)], score: 0, msg: "" })}>
              🎮 &quot;Top-chi!&quot; o&apos;yinini boshlash
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
