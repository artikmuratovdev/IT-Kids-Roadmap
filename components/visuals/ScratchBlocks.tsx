"use client";

import { useRef, useState } from "react";

type Op =
  | "flag" | "move" | "turn" | "goto" | "say" | "wait" | "sound" | "costume" | "color"
  | "repeat" | "forever" | "ifedge" | "setvar" | "changevar" | "ifvar" | "end";

interface Block { id: number; op: Op; a?: number | string; b?: number | string }

interface Def { op: Op; cat: string; color: string; label: (b: Block) => string; params?: ("a" | "b")[]; a?: number | string; b?: number | string; c?: boolean }

const DEFS: Def[] = [
  { op: "flag", cat: "Voqealar", color: "#FFBF00", label: () => "🏁 bayroq bosilganda" },
  { op: "move", cat: "Harakat", color: "#4C97FF", label: () => "(a) qadam yur", params: ["a"], a: 50 },
  { op: "turn", cat: "Harakat", color: "#4C97FF", label: () => "↻ (a) gradus buril", params: ["a"], a: 90 },
  { op: "goto", cat: "Harakat", color: "#4C97FF", label: () => "x: (a) y: (b) ga bor", params: ["a", "b"], a: 0, b: 0 },
  { op: "ifedge", cat: "Harakat", color: "#4C97FF", label: () => "chekkaga tegsa, qayt" },
  { op: "say", cat: "Ko'rinish", color: "#9966FF", label: () => "(a) de", params: ["a"], a: "Salom!" },
  { op: "costume", cat: "Ko'rinish", color: "#9966FF", label: () => "keyingi kostyum" },
  { op: "color", cat: "Ko'rinish", color: "#9966FF", label: () => "rang effektini (a) ga o'zgartir", params: ["a"], a: 25 },
  { op: "sound", cat: "Tovush", color: "#CF63CF", label: () => "🎵 miyov tovushini chal" },
  { op: "wait", cat: "Boshqaruv", color: "#FFAB19", label: () => "(a) soniya kut", params: ["a"], a: 1 },
  { op: "repeat", cat: "Boshqaruv", color: "#FFAB19", label: () => "(a) marta takrorla ⤵", params: ["a"], a: 4, c: true },
  { op: "forever", cat: "Boshqaruv", color: "#FFAB19", label: () => "doim takrorla ⤵", c: true },
  { op: "ifvar", cat: "Boshqaruv", color: "#FFAB19", label: () => "agar Ball > (a) bo'lsa ⤵", params: ["a"], a: 3, c: true },
  { op: "end", cat: "Boshqaruv", color: "#FFAB19", label: () => "⤴ tugadi" },
  { op: "setvar", cat: "O'zgaruvchi", color: "#FF8C1A", label: () => "Ball ni (a) ga o'rnat", params: ["a"], a: 0 },
  { op: "changevar", cat: "O'zgaruvchi", color: "#FF8C1A", label: () => "Ball ni (a) ga o'zgartir", params: ["a"], a: 1 },
];
const def = (op: Op) => DEFS.find((d) => d.op === op)!;

interface Sprite { x: number; y: number; dir: number; costume: number; hue: number; say: string; note: boolean }
interface Trace { turns: number; moves: number; said: string[]; usedRepeat: boolean; usedForever: boolean; bounced: boolean; sounds: number; costumes: number; score: number; final: Sprite; blockCount: number }

interface Challenge { title: string; hint: string; start: Omit<Block, "id">[]; check: (t: Trace) => boolean }

const CHALLENGES: Record<string, Challenge[]> = {
  motion: [
    { title: "Mushuk \"Salom!\" desin va 100 qadam yursin", hint: "🏁 + «de» + «qadam yur»", start: [{ op: "flag" }], check: (t) => t.said.some((s) => s.toLowerCase().includes("salom")) && t.moves >= 100 },
    { title: "Mushukni kvadrat bo'ylab yurgizib, joyiga qaytaring", hint: "4 marta: yur + 90° buril", start: [{ op: "flag" }], check: (t) => t.turns >= 360 && Math.abs(t.final.x) < 1 && Math.abs(t.final.y) < 1 && t.moves > 0 },
    { title: "Yurib borib, tovush chiqarib \"Voy!\" desin", hint: "yur + tovush + de", start: [{ op: "flag" }], check: (t) => t.sounds > 0 && t.said.some((s) => s.toLowerCase().includes("voy")) },
  ],
  loops: [
    { title: "Kvadratni «takrorla» bloki bilan chizing (5 blokdan kam)", hint: "4 marta takrorla: yur, buril, tugadi", start: [{ op: "flag" }], check: (t) => t.usedRepeat && t.turns >= 360 && t.blockCount <= 5 && Math.abs(t.final.x) < 1 && Math.abs(t.final.y) < 1 },
    { title: "Yurish animatsiyasi: 10 marta kostyum almashsin", hint: "10 marta takrorla: keyingi kostyum, kut, yur", start: [{ op: "flag" }], check: (t) => t.costumes >= 10 && t.usedRepeat },
    { title: "Akvarium: doim suzsin, chekkaga tegsa qaytsin", hint: "doim takrorla: yur, chekkaga tegsa qayt", start: [{ op: "flag" }], check: (t) => t.usedForever && t.bounced },
  ],
  vars: [
    { title: "Ballni 0 ga o'rnating va 5 marta 1 ga oshiring", hint: "o'rnat 0 → 5 marta takrorla: o'zgartir 1", start: [{ op: "flag" }], check: (t) => t.score === 5 && t.usedRepeat },
    { title: "Ball 3 dan oshsa, mushuk \"G'alaba!\" desin", hint: "agar Ball > 3 bo'lsa: de G'alaba!", start: [{ op: "flag" }, { op: "setvar", a: 0 }], check: (t) => t.score > 3 && t.said.some((s) => s.toLowerCase().includes("alaba")) },
  ],
};

const SCALE = 0.75; // 480x360 → 360x270
let uid = 1000;

function buildTree(blocks: Block[]) {
  type N = { b: Block; body?: N[] };
  const root: N[] = [];
  const stack: N[][] = [root];
  for (const b of blocks) {
    if (b.op === "flag") continue;
    if (b.op === "end") { if (stack.length > 1) stack.pop(); continue; }
    const n: N = { b };
    stack[stack.length - 1].push(n);
    if (def(b.op).c) { n.body = []; stack.push(n.body); }
  }
  return root;
}

export default function ScratchBlocks({ preset }: { preset?: string }) {
  const set = CHALLENGES[preset ?? ""] ?? CHALLENGES.motion;
  const [ci, setCi] = useState(0);
  const ch = set[ci];
  const [script, setScript] = useState<Block[]>(() => ch.start.map((b) => ({ ...b, id: uid++ })));
  const [sprite, setSprite] = useState<Sprite>({ x: 0, y: 0, dir: 90, costume: 0, hue: 0, say: "", note: false });
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<null | boolean>(null);
  const [trail, setTrail] = useState<[number, number][]>([]);
  const cancel = useRef(false);

  function add(op: Op) {
    const d = def(op);
    setScript((s) => [...s, { id: uid++, op, a: d.a, b: d.b }]);
  }
  function update(id: number, k: "a" | "b", v: string) {
    setScript((s) => s.map((b) => (b.id === id ? { ...b, [k]: v } : b)));
  }
  function remove(id: number) {
    setScript((s) => s.filter((b) => b.id !== id));
  }
  function moveBlock(id: number, d: number) {
    setScript((s) => {
      const i = s.findIndex((b) => b.id === id);
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const c = [...s];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  }
  function selectChallenge(i: number) {
    cancel.current = true;
    setCi(i);
    setScript(set[i].start.map((b) => ({ ...b, id: uid++ })));
    resetStage();
  }
  function resetStage() {
    setSprite({ x: 0, y: 0, dir: 90, costume: 0, hue: 0, say: "", note: false });
    setScore(0);
    setTrail([]);
    setResult(null);
  }

  async function run() {
    if (!script.some((b) => b.op === "flag")) {
      setResult(false);
      setSprite((s) => ({ ...s, say: "🏁 bloki kerak!" }));
      return;
    }
    cancel.current = false;
    setRunning(true);
    resetStage();
    const sp: Sprite = { x: 0, y: 0, dir: 90, costume: 0, hue: 0, say: "", note: false };
    const tr: Trace = { turns: 0, moves: 0, said: [], usedRepeat: false, usedForever: false, bounced: false, sounds: 0, costumes: 0, score: 0, final: sp, blockCount: script.filter((b) => b.op !== "end").length };
    let sc = 0;
    let steps = 0;
    const pts: [number, number][] = [[0, 0]];
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const show = async (ms = 120) => {
      setSprite({ ...sp });
      setScore(sc);
      setTrail([...pts]);
      await sleep(ms);
    };
    const num = (v: unknown) => Number(v) || 0;

    type N = { b: Block; body?: N[] };
    async function exec(nodes: N[]): Promise<void> {
      for (const n of nodes) {
        if (cancel.current || steps > 400) return;
        steps++;
        const b = n.b;
        switch (b.op) {
          case "move": {
            const r = ((90 - sp.dir) * Math.PI) / 180;
            const d = num(b.a);
            sp.x = Math.round((sp.x + Math.cos(r) * d) * 100) / 100;
            sp.y = Math.round((sp.y + Math.sin(r) * d) * 100) / 100;
            sp.x = Math.max(-240, Math.min(240, sp.x));
            sp.y = Math.max(-180, Math.min(180, sp.y));
            tr.moves += Math.abs(d);
            pts.push([sp.x, sp.y]);
            await show();
            break;
          }
          case "turn": sp.dir = (sp.dir + num(b.a)) % 360; tr.turns += Math.abs(num(b.a)); await show(80); break;
          case "goto": sp.x = num(b.a); sp.y = num(b.b); pts.push([sp.x, sp.y]); await show(); break;
          case "ifedge":
            if (Math.abs(sp.x) >= 200 || Math.abs(sp.y) >= 150) { sp.dir = (360 - sp.dir) % 360; tr.bounced = true; await show(60); }
            break;
          case "say": sp.say = String(b.a ?? ""); tr.said.push(sp.say); await show(700); break;
          case "costume": sp.costume = (sp.costume + 1) % 2; tr.costumes++; await show(120); break;
          case "color": sp.hue = (sp.hue + num(b.a)) % 200; await show(80); break;
          case "sound": sp.note = true; tr.sounds++; await show(400); sp.note = false; await show(10); break;
          case "wait": await show(Math.min(num(b.a), 3) * 1000); break;
          case "setvar": sc = num(b.a); await show(150); break;
          case "changevar": sc += num(b.a); await show(150); break;
          case "repeat": tr.usedRepeat = true; for (let i = 0; i < Math.min(num(b.a), 50); i++) await exec(n.body ?? []); break;
          case "forever": tr.usedForever = true; for (let i = 0; i < 60 && !cancel.current; i++) await exec(n.body ?? []); break;
          case "ifvar": if (sc > num(b.a)) await exec(n.body ?? []); break;
        }
      }
    }
    await exec(buildTree(script));
    tr.final = sp;
    tr.score = sc;
    await show(10);
    setRunning(false);
    if (!cancel.current) setResult(ch.check(tr));
  }

  let depth = 0;
  const cats = Array.from(new Set(DEFS.map((d) => d.cat)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {set.map((c, i) => (
          <button key={i} onClick={() => selectChallenge(i)} className={`chip py-1.5 ${i === ci ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-900"}`}>
            {i + 1}-topshiriq
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
        <p className="font-black">🎯 {ch.title}</p>
        <p className="text-sm text-amber-800">💡 Maslahat: {ch.hint}</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-[200px_1fr_372px]">
        {/* Bloklar palitrasi */}
        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
          {cats.map((cat) => (
            <div key={cat}>
              <p className="px-1 text-xs font-black text-slate-500">{cat}</p>
              {DEFS.filter((d) => d.cat === cat).map((d) => (
                <button key={d.op} onClick={() => add(d.op)} className="mt-1 block w-full rounded-md px-2 py-1 text-left text-xs font-bold text-white shadow-sm hover:brightness-110" style={{ background: d.color }}>
                  {d.label({ id: 0, op: d.op }).replace("(a)", String(d.a ?? "")).replace("(b)", String(d.b ?? ""))}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Skript maydoni */}
        <div className="min-h-64 space-y-1 rounded-xl bg-white p-3 ring-1 ring-slate-200" style={{ backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)", backgroundSize: "16px 16px" }}>
          <p className="mb-1 text-xs font-bold text-slate-400">Kod maydoni — blokni qo&apos;shish uchun chapdagisini bosing</p>
          {script.map((b) => {
            const d = def(b.op);
            if (b.op === "end") depth = Math.max(0, depth - 1);
            const indent = depth;
            if (d.c) depth++;
            const parts = d.label(b).split(/(\([ab]\))/);
            return (
              <div key={b.id} className="group flex items-center gap-1" style={{ marginLeft: indent * 22 }}>
                <div className={`flex flex-wrap items-center gap-1 px-2.5 py-1.5 text-sm font-bold text-white shadow ${b.op === "flag" ? "rounded-t-2xl rounded-b-md" : "rounded-md"}`} style={{ background: d.color }}>
                  {parts.map((p, i) =>
                    p === "(a)" || p === "(b)" ? (
                      <input
                        key={i}
                        value={String(b[p[1] as "a" | "b"] ?? "")}
                        onChange={(e) => update(b.id, p[1] as "a" | "b", e.target.value)}
                        className="w-16 rounded-full bg-white px-2 text-center text-slate-800 outline-none"
                        disabled={running}
                      />
                    ) : (
                      <span key={i}>{p}</span>
                    ),
                  )}
                </div>
                <span className="flex opacity-0 transition group-hover:opacity-100">
                  <button className="px-1 text-xs" onClick={() => moveBlock(b.id, -1)} disabled={running} title="Yuqoriga">⬆️</button>
                  <button className="px-1 text-xs" onClick={() => moveBlock(b.id, 1)} disabled={running} title="Pastga">⬇️</button>
                  <button className="px-1 text-xs" onClick={() => remove(b.id)} disabled={running} title="O'chirish">🗑️</button>
                </span>
              </div>
            );
          })}
        </div>

        {/* Sahna */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button className="btn bg-emerald-500 px-3 py-1 text-white" onClick={run} disabled={running}>🏁 Ishga tushir</button>
            <button className="btn bg-rose-500 px-3 py-1 text-white" onClick={() => { cancel.current = true; }} disabled={!running}>⏹ To&apos;xtat</button>
            <span className="ml-auto rounded-md bg-orange-100 px-2 py-0.5 text-sm font-bold text-orange-800">Ball: {score}</span>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-white ring-2 ring-slate-300" style={{ width: 480 * SCALE, height: 360 * SCALE, maxWidth: "100%" }}>
            <svg className="absolute inset-0" width={480 * SCALE} height={360 * SCALE}>
              <polyline
                points={trail.map(([x, y]) => `${(x + 240) * SCALE},${(180 - y) * SCALE}`).join(" ")}
                fill="none"
                stroke="#a5b4fc"
                strokeWidth="3"
                strokeDasharray="6 4"
              />
            </svg>
            <div
              className="absolute text-5xl transition-all duration-100"
              style={{
                left: (sprite.x + 240) * SCALE - 24,
                top: (180 - sprite.y) * SCALE - 30,
                transform: `rotate(${sprite.dir - 90}deg) scaleY(${sprite.costume ? 0.85 : 1})`,
                filter: `hue-rotate(${sprite.hue * 1.8}deg)`,
              }}
            >
              🐱
            </div>
            {sprite.say && (
              <div className="absolute rounded-xl border-2 border-slate-300 bg-white px-2 py-1 text-sm font-bold" style={{ left: (sprite.x + 240) * SCALE + 10, top: Math.max(0, (180 - sprite.y) * SCALE - 70) }}>
                {sprite.say}
              </div>
            )}
            {sprite.note && <div className="absolute right-2 top-2 animate-bounce text-3xl">🎵</div>}
            <div className="absolute bottom-1 left-2 font-mono text-[10px] text-slate-400">x: {Math.round(sprite.x)} y: {Math.round(sprite.y)} yo&apos;nalish: {sprite.dir}°</div>
          </div>
          {result !== null && (
            <p className={`rounded-lg p-2 text-sm font-bold ${result ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
              {result ? "🎉 Zo'r! Topshiriq bajarildi!" : "🤔 Hali emas. Maslahatni o'qib, yana urinib ko'ring."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
