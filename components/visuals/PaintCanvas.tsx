"use client";

import { useEffect, useRef, useState } from "react";

type Tool = "pen" | "eraser" | "line" | "rect" | "circle" | "fill";
const COLORS = ["#000000", "#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#6366f1", "#a855f7", "#ec4899", "#78350f", "#ffffff", "#94a3b8"];
const TOOLS: { id: Tool; label: string }[] = [
  { id: "pen", label: "✏️ Qalam" },
  { id: "eraser", label: "🧽 O'chirg'ich" },
  { id: "line", label: "📏 Chiziq" },
  { id: "rect", label: "⬛ To'rtburchak" },
  { id: "circle", label: "⚪ Aylana" },
  { id: "fill", label: "🪣 Bo'yash" },
];

const W = 800;
const H = 450;

function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const i0 = (y * W + x) * 4;
  const target = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
  const rgb = [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), 255];
  if (target.every((v, k) => Math.abs(v - rgb[k]) < 4)) return;
  const same = (i: number) => Math.abs(d[i] - target[0]) < 40 && Math.abs(d[i + 1] - target[1]) < 40 && Math.abs(d[i + 2] - target[2]) < 40 && Math.abs(d[i + 3] - target[3]) < 40;
  const stack = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue;
    const i = (cy * W + cx) * 4;
    if (!same(i)) continue;
    d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  ctx.putImageData(img, 0, 0);
}

export default function PaintCanvas() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#0ea5e9");
  const [size, setSize] = useState(6);
  const history = useRef<ImageData[]>([]);
  const start = useRef<{ x: number; y: number; snap: ImageData } | null>(null);

  useEffect(() => {
    const ctx = canvas.current!.getContext("2d", { willReadFrequently: true })!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
  }, []);

  const ctx = () => canvas.current!.getContext("2d", { willReadFrequently: true })!;
  const pos = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: Math.round(((e.clientX - r.left) / r.width) * W), y: Math.round(((e.clientY - r.top) / r.height) * H) };
  };

  function down(e: React.PointerEvent) {
    const c = ctx();
    const p = pos(e);
    history.current.push(c.getImageData(0, 0, W, H));
    if (history.current.length > 30) history.current.shift();
    if (tool === "fill") {
      floodFill(c, p.x, p.y, color);
      return;
    }
    canvas.current!.setPointerCapture(e.pointerId);
    start.current = { ...p, snap: c.getImageData(0, 0, W, H) };
    c.lineCap = "round";
    c.lineJoin = "round";
    c.lineWidth = size;
    c.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    c.beginPath();
    c.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent) {
    if (!start.current) return;
    const c = ctx();
    const p = pos(e);
    if (tool === "pen" || tool === "eraser") {
      c.lineTo(p.x, p.y);
      c.stroke();
      return;
    }
    c.putImageData(start.current.snap, 0, 0);
    c.beginPath();
    const s = start.current;
    if (tool === "line") { c.moveTo(s.x, s.y); c.lineTo(p.x, p.y); }
    if (tool === "rect") c.rect(s.x, s.y, p.x - s.x, p.y - s.y);
    if (tool === "circle") c.ellipse((s.x + p.x) / 2, (s.y + p.y) / 2, Math.abs(p.x - s.x) / 2, Math.abs(p.y - s.y) / 2, 0, 0, Math.PI * 2);
    c.stroke();
  }

  function up() {
    start.current = null;
  }

  function undo() {
    const last = history.current.pop();
    if (last) ctx().putImageData(last, 0, 0);
  }

  function clear() {
    history.current.push(ctx().getImageData(0, 0, W, H));
    const c = ctx();
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, W, H);
  }

  function save() {
    const a = document.createElement("a");
    a.href = canvas.current!.toDataURL("image/png");
    a.download = "mening-rasmim.png";
    a.click();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100 p-2">
        {TOOLS.map((t) => (
          <button key={t.id} onClick={() => setTool(t.id)} className={`chip py-1.5 ${tool === t.id ? "bg-indigo-600 text-white" : "bg-white"}`}>
            {t.label}
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-slate-300" />
        <label className="flex items-center gap-1 text-xs font-bold">
          Qalinlik
          <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(+e.target.value)} />
        </label>
        <span className="mx-1 h-6 w-px bg-slate-300" />
        <button className="chip bg-white py-1.5" onClick={undo}>↩️ Orqaga (Ctrl+Z)</button>
        <button className="chip bg-white py-1.5" onClick={clear}>🧹 Tozalash</button>
        <button className="chip bg-emerald-500 py-1.5 text-white" onClick={save}>💾 Saqlash (PNG)</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            aria-label={c}
            onClick={() => setColor(c)}
            className={`h-8 w-8 rounded-full ring-2 ${color === c ? "scale-110 ring-indigo-600" : "ring-slate-300"}`}
            style={{ background: c }}
          />
        ))}
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 cursor-pointer rounded" title="Boshqa rang" />
      </div>
      <canvas
        ref={canvas}
        width={W}
        height={H}
        className="w-full touch-none rounded-xl bg-white ring-1 ring-slate-300"
        style={{ cursor: "crosshair" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
      />
      <p className="text-sm text-slate-500">💡 Vazifa: uy, quyosh, daraxt va bulut chizing. Aylana va to&apos;rtburchakdan foydalaning, keyin 🪣 bilan bo&apos;yang!</p>
    </div>
  );
}
