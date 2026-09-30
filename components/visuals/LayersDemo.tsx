"use client";

import { useState } from "react";

interface Layer {
  id: string;
  name: string;
  kind: "bg" | "emoji" | "text";
  content: string;
  visible: boolean;
  opacity: number;
  x: number;
  y: number;
  size: number;
}

const BACKGROUNDS: Record<string, string> = {
  "🌅 Quyosh botishi": "linear-gradient(180deg,#fb923c 0%,#f472b6 55%,#7c3aed 100%)",
  "🏖️ Dengiz qirg'og'i": "linear-gradient(180deg,#7dd3fc 0%,#bae6fd 55%,#fde68a 56%,#fcd34d 100%)",
  "🌌 Kosmos": "radial-gradient(circle at 30% 30%,#312e81 0%,#0f172a 70%)",
  "🌳 O'rmon": "linear-gradient(180deg,#bbf7d0 0%,#4ade80 60%,#166534 100%)",
  "🏙️ Shahar": "linear-gradient(180deg,#e0e7ff 0%,#a5b4fc 60%,#475569 61%,#334155 100%)",
  "⬜ Shaffof (fonsiz)": "repeating-conic-gradient(#e2e8f0 0% 25%, #fff 0% 50%) 50% / 24px 24px",
};

const FILTERS = [
  { key: "brightness", label: "☀️ Yorqinlik", min: 0, max: 200, def: 100, unit: "%" },
  { key: "contrast", label: "🌓 Kontrast", min: 0, max: 200, def: 100, unit: "%" },
  { key: "saturate", label: "🌈 To'yinganlik", min: 0, max: 300, def: 100, unit: "%" },
  { key: "hue-rotate", label: "🎨 Rang tusi", min: 0, max: 360, def: 0, unit: "deg" },
  { key: "grayscale", label: "⚫ Oq-qora", min: 0, max: 100, def: 0, unit: "%" },
  { key: "sepia", label: "📜 Sepiya (eski rasm)", min: 0, max: 100, def: 0, unit: "%" },
  { key: "blur", label: "💧 Xiralashtirish", min: 0, max: 10, def: 0, unit: "px" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];
const defaultFilters = () => Object.fromEntries(FILTERS.map((f) => [f.key, f.def])) as Record<FilterKey, number>;

const START: Layer[] = [
  { id: "t", name: "Matn", kind: "text", content: "Mening posterim", visible: true, opacity: 100, x: 50, y: 15, size: 36 },
  { id: "s", name: "Stiker", kind: "emoji", content: "⭐", visible: true, opacity: 100, x: 80, y: 70, size: 56 },
  { id: "p", name: "Qahramon", kind: "emoji", content: "🐶", visible: true, opacity: 100, x: 40, y: 62, size: 110 },
  { id: "bg", name: "Fon", kind: "bg", content: "🌅 Quyosh botishi", visible: true, opacity: 100, x: 0, y: 0, size: 0 },
];

export default function LayersDemo() {
  const [layers, setLayers] = useState<Layer[]>(START);
  const [sel, setSel] = useState("p");
  const [filters, setFilters] = useState<Record<string, Record<FilterKey, number>>>({});
  const [textColor, setTextColor] = useState("#ffffff");
  const [shadow, setShadow] = useState(true);

  const layer = layers.find((l) => l.id === sel)!;
  const f = filters[sel] ?? defaultFilters();
  const filterCss = (id: string) => {
    const ff = filters[id];
    if (!ff) return undefined;
    return FILTERS.map((d) => `${d.key}(${ff[d.key]}${d.unit})`).join(" ");
  };

  const patch = (id: string, p: Partial<Layer>) => setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...p } : l)));
  function move(id: string, d: number) {
    setLayers((ls) => {
      const i = ls.findIndex((l) => l.id === id);
      const j = i + d;
      if (j < 0 || j >= ls.length) return ls;
      const c = [...ls];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  }
  function addLayer(kind: "emoji" | "text") {
    const id = Math.random().toString(36).slice(2, 7);
    const l: Layer = kind === "text"
      ? { id, name: "Yangi matn", kind, content: "Salom!", visible: true, opacity: 100, x: 50, y: 88, size: 28 }
      : { id, name: "Yangi stiker", kind, content: "🎈", visible: true, opacity: 100, x: 20, y: 30, size: 60 };
    setLayers((ls) => [l, ...ls]);
    setSel(id);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-800 ring-1 ring-slate-300">
          {[...layers].reverse().map((l) =>
            !l.visible ? null : l.kind === "bg" ? (
              <div key={l.id} className="absolute inset-0" style={{ background: BACKGROUNDS[l.content], opacity: l.opacity / 100, filter: filterCss(l.id) }} />
            ) : (
              <div
                key={l.id}
                onClick={() => setSel(l.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none whitespace-nowrap ${sel === l.id ? "outline-2 outline-offset-4 outline-dashed outline-sky-400" : ""}`}
                style={{
                  left: `${l.x}%`,
                  top: `${l.y}%`,
                  fontSize: l.size,
                  opacity: l.opacity / 100,
                  filter: filterCss(l.id),
                  color: l.kind === "text" ? textColor : undefined,
                  fontWeight: 900,
                  textShadow: l.kind === "text" && shadow ? "0 3px 8px rgba(0,0,0,.6)" : undefined,
                }}
              >
                {l.content}
              </div>
            ),
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-sm font-bold">Fon almashtirish:</span>
          {Object.keys(BACKGROUNDS).map((b) => (
            <button key={b} onClick={() => patch("bg", { content: b })} className={`chip py-1 ${layers.find((l) => l.id === "bg")?.content === b ? "bg-rose-500 text-white" : "bg-slate-100"}`}>{b}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl bg-slate-800 text-sm text-white">
          <div className="flex items-center justify-between bg-slate-900 px-3 py-2">
            <b>🗂️ Qatlamlar (Layers)</b>
            <span className="flex gap-1">
              <button className="chip bg-slate-700 py-1" onClick={() => addLayer("text")}>+ T</button>
              <button className="chip bg-slate-700 py-1" onClick={() => addLayer("emoji")}>+ 🎈</button>
            </span>
          </div>
          {layers.map((l, i) => (
            <div key={l.id} onClick={() => setSel(l.id)} className={`flex cursor-pointer items-center gap-2 border-t border-slate-700 px-3 py-2 ${sel === l.id ? "bg-sky-700" : "hover:bg-slate-700"}`}>
              <button onClick={(e) => { e.stopPropagation(); patch(l.id, { visible: !l.visible }); }} title="Ko'rinish">{l.visible ? "👁️" : "🚫"}</button>
              <span className="grid h-8 w-10 place-items-center rounded bg-slate-600 text-lg">{l.kind === "bg" ? "🖼️" : l.kind === "text" ? "T" : l.content}</span>
              <span className="flex-1 truncate">{l.name}</span>
              <button onClick={(e) => { e.stopPropagation(); move(l.id, -1); }} disabled={i === 0} className="disabled:opacity-30">⬆️</button>
              <button onClick={(e) => { e.stopPropagation(); move(l.id, 1); }} disabled={i === layers.length - 1} className="disabled:opacity-30">⬇️</button>
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-xl bg-rose-50 p-3 text-sm ring-1 ring-rose-100">
          <p className="font-black">⚙️ &quot;{layer.name}&quot; qatlami</p>
          <label className="flex items-center gap-2">Shaffoflik (Opacity) <input type="range" min={0} max={100} value={layer.opacity} onChange={(e) => patch(sel, { opacity: +e.target.value })} className="flex-1" /> {layer.opacity}%</label>
          {layer.kind !== "bg" && (
            <>
              <label className="flex items-center gap-2">X <input type="range" min={0} max={100} value={layer.x} onChange={(e) => patch(sel, { x: +e.target.value })} className="flex-1" /></label>
              <label className="flex items-center gap-2">Y <input type="range" min={0} max={100} value={layer.y} onChange={(e) => patch(sel, { y: +e.target.value })} className="flex-1" /></label>
              <label className="flex items-center gap-2">O&apos;lcham <input type="range" min={12} max={200} value={layer.size} onChange={(e) => patch(sel, { size: +e.target.value })} className="flex-1" /></label>
              <input className="input py-1" value={layer.content} onChange={(e) => patch(sel, { content: e.target.value })} aria-label="Qatlam matni" />
            </>
          )}
          {layer.kind === "text" && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1">Rang <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} /></label>
              <label className="flex items-center gap-1"><input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} /> Soya (Drop Shadow)</label>
            </div>
          )}
        </div>

        <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <p className="font-black">🎛️ Filtrlar va ranglar</p>
            <button className="chip bg-white py-1 ring-1 ring-slate-200" onClick={() => setFilters({ ...filters, [sel]: defaultFilters() })}>↺ Tiklash</button>
          </div>
          {FILTERS.map((d) => (
            <label key={d.key} className="flex items-center gap-2">
              <span className="w-40 shrink-0">{d.label}</span>
              <input type="range" min={d.min} max={d.max} value={f[d.key]} onChange={(e) => setFilters({ ...filters, [sel]: { ...f, [d.key]: +e.target.value } })} className="flex-1" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
