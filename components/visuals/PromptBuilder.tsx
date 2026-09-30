"use client";

import { useState } from "react";

type Mode = "rasm" | "matn" | "video" | "musiqa" | "slayd";

const PARTS: Record<Mode, { key: string; label: string; options: string[] }[]> = {
  rasm: [
    { key: "who", label: "Kim / nima?", options: ["qizil mushukcha", "kosmonavt bola", "sehrli ajdarho", "robot oshpaz", "kichkina fil"] },
    { key: "do", label: "Nima qilyapti?", options: ["kitob o'qiyapti", "futbol o'ynayapti", "oyda sakrayapti", "tort pishiryapti", "gullar sug'oryapti"] },
    { key: "where", label: "Qayerda?", options: ["Samarqand Registon maydonida", "sehrli o'rmonda", "kosmik kemada", "qor yog'ayotgan tog'da", "dengiz tubida"] },
    { key: "style", label: "Uslub", options: ["multfilm uslubida", "akvarel rasm", "3D Pixar uslubida", "piksel-art", "realistik foto"] },
    { key: "mood", label: "Rang va kayfiyat", options: ["yorqin quvnoq ranglar", "quyosh botayotgan iliq ranglar", "pastel yumshoq ranglar", "tungi neon ranglar"] },
  ],
  matn: [
    { key: "role", label: "AI kim bo'lsin?", options: ["mehribon o'qituvchi", "qiziqarli ertakchi", "sport murabbiyi", "olim"] },
    { key: "task", label: "Vazifa", options: ["menga tushuntirib ber", "qisqa ertak yozib ber", "5 ta savol tuz", "reja tuzib ber"] },
    { key: "topic", label: "Mavzu", options: ["quyosh tizimi haqida", "do'stlik haqida", "kompyuter qanday ishlashi haqida", "sog'lom ovqatlanish haqida"] },
    { key: "for", label: "Kim uchun?", options: ["10 yoshli bola uchun", "sinfdoshlarim uchun", "ota-onam uchun"] },
    { key: "format", label: "Shakl", options: ["5 ta qisqa punkt bilan", "100 so'zdan oshmasin", "emoji bilan", "jadval ko'rinishida"] },
  ],
  video: [
    { key: "who", label: "Qahramon", options: ["oq ot", "kichkina robot", "bola va kuchukcha", "kapalak"] },
    { key: "do", label: "Harakat", options: ["dala bo'ylab chopib ketyapti", "osmonga uchib ketyapti", "qor odam yasayapti", "raqsga tushyapti"] },
    { key: "cam", label: "Kamera", options: ["kamera sekin yaqinlashadi", "yuqoridan ko'rinish (dron)", "kamera qahramon ortidan boradi"] },
    { key: "style", label: "Uslub", options: ["multfilm", "kinematografik", "slow motion", "anime uslubida"] },
    { key: "len", label: "Davomiyligi", options: ["5 soniya", "8 soniya", "10 soniya"] },
  ],
  musiqa: [
    { key: "genre", label: "Janr", options: ["bolalar qo'shig'i", "pop", "o'zbek xalq uslubida", "rok", "lo-fi"] },
    { key: "topic", label: "Mavzu", options: ["maktab va do'stlar haqida", "yoz ta'tili haqida", "onam haqida", "kompyuter o'rganish haqida"] },
    { key: "mood", label: "Kayfiyat", options: ["quvnoq va energik", "sokin va mayin", "g'ururli"] },
    { key: "voice", label: "Ovoz", options: ["bolalar ovozi", "ayol ovozi", "erkak ovozi", "faqat musiqa (so'zsiz)"] },
    { key: "inst", label: "Asboblar", options: ["pianino va baraban", "gitara", "doira va rubob", "elektron"] },
  ],
  slayd: [
    { key: "count", label: "Nechta slayd", options: ["5 ta slayd", "7 ta slayd", "10 ta slayd"] },
    { key: "topic", label: "Mavzu", options: ["O'zbekistonning tarixiy shaharlari", "Hayvonot olami", "Kosmos sirlari", "Sog'lom turmush tarzi"] },
    { key: "for", label: "Auditoriya", options: ["4-sinf o'quvchilari uchun", "ota-onalar uchun"] },
    { key: "each", label: "Har slaydda", options: ["sarlavha, 3 ta punkt va rasm g'oyasi", "savol va javob", "qiziqarli fakt"] },
    { key: "style", label: "Dizayn", options: ["yorqin ranglar", "minimalistik", "bolalarbop multfilm"] },
  ],
};

const TOOLS: Record<Mode, string> = {
  rasm: "Gemini, ChatGPT, Ideogram, Leonardo",
  matn: "ChatGPT, Gemini, Claude",
  video: "Qwen, Kling, Pika",
  musiqa: "Suno AI, Gemini",
  slayd: "Gamma, Canva AI, Gemini",
};

export default function PromptBuilder({ preset }: { preset?: string }) {
  const [mode, setMode] = useState<Mode>((preset as Mode) in PARTS ? (preset as Mode) : "rasm");
  const [pick, setPick] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const parts = PARTS[mode];
  const chosen = parts.map((p) => pick[`${mode}.${p.key}`]).filter(Boolean);
  const score = chosen.length;
  const prompt =
    mode === "matn"
      ? chosen.length ? `Sen ${chosen.join(", ")}.` : ""
      : chosen.join(", ");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(PARTS) as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`chip py-1.5 capitalize ${mode === m ? "bg-violet-600 text-white" : "bg-slate-100"}`}>
            {{ rasm: "🖼️ Rasm", matn: "💬 Matn", video: "🎥 Video", musiqa: "🎶 Musiqa", slayd: "📑 Slayd" }[m]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {parts.map((p) => {
          const k = `${mode}.${p.key}`;
          return (
            <div key={k} className="rounded-xl bg-violet-50 p-3 ring-1 ring-violet-100">
              <p className="mb-2 text-sm font-black text-violet-800">{p.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.options.map((o) => (
                  <button
                    key={o}
                    onClick={() => setPick({ ...pick, [k]: pick[k] === o ? "" : o })}
                    className={`chip py-1 ${pick[k] === o ? "bg-violet-600 text-white" : "bg-white ring-1 ring-violet-200"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rounded-2xl bg-slate-900 p-4 text-white">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-slate-300">✨ Tayyor prompt</p>
          <span className="text-sm">
            Sifat: {"⭐".repeat(score)}{"☆".repeat(parts.length - score)}
          </span>
        </div>
        <p className="min-h-12 font-mono text-lg text-emerald-300">{prompt || "Yuqoridan bo'laklarni tanlang..."}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="btn bg-white px-3 py-1 text-slate-900"
            disabled={!prompt}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(prompt);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              } catch {
                /* clipboard yo'q */
              }
            }}
          >
            {copied ? "✅ Nusxalandi" : "📋 Nusxa olish"}
          </button>
          <span className="text-xs text-slate-400">Qayerda ishlatish mumkin: {TOOLS[mode]}</span>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        💡 Yaxshi prompt = <b>kim/nima</b> + <b>nima qilyapti</b> + <b>qayerda</b> + <b>uslub</b> + <b>rang/kayfiyat</b>. Qancha aniq yozsangiz, natija shuncha yaxshi!
      </p>
    </div>
  );
}
