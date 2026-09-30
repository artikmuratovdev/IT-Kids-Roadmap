"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type GameKey = "snake" | "dino" | "balloon" | "mole";
type Phase = "ready" | "play" | "over";

const W = 480;
const H = 360;

const GAMES: Record<GameKey, { title: string; emoji: string; controls: string; steps: string[] }> = {
  snake: {
    title: "Snake",
    emoji: "🐍",
    controls: "Strelkalar yoki W A S D",
    steps: [
      "🏁 bosilganda: Uzunlik = 3, Ball = 0, x:0 y:0 ga bor",
      "Strelka bosilganda: yo'nalishni 0 / 90 / 180 / −90 ga o'rnat",
      "Doim takrorla: 20 qadam yur, o'zimning klonimni yarat, 0.15 kut",
      "Klon: Uzunlik × 0.15 soniya kut → bu klonni o'chir (dum!)",
      "Agar Olma ga tegsa: Uzunlik +1, Ball +1, olma istalgan joyga",
      "Agar chekkaga yoki dum rangiga tegsa → Game Over",
    ],
  },
  dino: {
    title: "Dino (ayiq bilan)",
    emoji: "🐻",
    controls: "Probel, ↑ yoki sichqoncha bosish — sakrash",
    steps: [
      "Sprite: Bear-walking, kostyumlar bilan yurish animatsiyasi",
      "O'zgaruvchi «y tezligi»: probel bosilganda va yerda bo'lsa → 14",
      "Doim takrorla: y ni «y tezligi» ga o'zgartir, «y tezligi» ni −1 ga o'zgartir",
      "Yerga tushsa (y < −100): y = −100, «y tezligi» = 0",
      "To'siq: x = 240 dan boshlab doim «x ni −Tezlik ga o'zgartir»",
      "Ayiq to'siqqa tegsa → Game Over, Ball > Rekord bo'lsa Rekord = Ball",
    ],
  },
  balloon: {
    title: "Balloon shooter",
    emoji: "🎈",
    controls: "Sichqoncha bilan sharni bosing",
    steps: [
      "Nishon sprite: doim «sichqoncha kursori ga bor»",
      "Shar: doim takrorla — o'zimning klonimni yarat, 0.6 kut",
      "Klon: x = tasodifiy −220…220, y = −180, rang effekti tasodifiy",
      "Klon: y > 180 bo'lguncha y ni 3 ga o'zgartir, keyin o'chir",
      "Klon bosilganda: pop tovushi, Ball +1, bu klonni o'chir",
      "Tilla shar +5, bomba −3; Vaqt = 0 → Game Over",
    ],
  },
  mole: {
    title: "Mole strike",
    emoji: "🔨",
    controls: "Sichqoncha bilan ko'rsichqonni urib qoling",
    steps: [
      "Fon: 9 ta teshik. Ro'yxat «TeshikX» va «TeshikY» ga 9 ta koordinata",
      "Bolg'a sprite: doim sichqoncha kursoriga bor",
      "Ko'rsichqon: n = 1 dan 9 gacha tasodifiy son",
      "x: «TeshikX» ning n-elementi, y: «TeshikY» ning n-elementi ga bor, ko'rsat",
      "Kutish vaqti o'tsa — yashir; bosilsa Ball +1, yashir",
      "Ball oshgan sari kutish vaqti kamayadi — qiyinlik!",
    ],
  },
};

const BEST_KEY = (g: GameKey) => `itkids-game-best-${g}`;

function readBest(g: GameKey): number {
  try {
    return Number(localStorage.getItem(BEST_KEY(g))) || 0;
  } catch {
    return 0;
  }
}

function writeBest(g: GameKey, v: number) {
  try {
    localStorage.setItem(BEST_KEY(g), String(v));
  } catch {
    /* localStorage mavjud emas */
  }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function emoji(ctx: CanvasRenderingContext2D, e: string, x: number, y: number, size: number) {
  ctx.font = `${size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(e, x, y);
}

/* ---------------- O'yin holatlari ---------------- */

interface SnakeState { cells: [number, number][]; dir: [number, number]; next: [number, number]; food: [number, number]; acc: number; step: number }
interface DinoState { y: number; vy: number; obs: { x: number; e: string; w: number }[]; speed: number; spawn: number; t: number; frame: number }
interface Balloon { x: number; y: number; vy: number; kind: "normal" | "gold" | "bomb"; hue: number }
interface BalloonState { list: Balloon[]; spawn: number; time: number; pops: { x: number; y: number; t: number; text: string }[] }
interface MoleState { hole: number; up: number; stay: number; wait: number; time: number; hit: number }

const COLS = 24;
const ROWS = 18;
const CELL = 20;
const HOLES: [number, number][] = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => [110 + c * 130, 90 + r * 100] as [number, number]));

type State = SnakeState | DinoState | BalloonState | MoleState;

function freeCell(cells: [number, number][]): [number, number] {
  for (;;) {
    const c: [number, number] = [Math.floor(rand(0, COLS)), Math.floor(rand(0, ROWS))];
    if (!cells.some(([x, y]) => x === c[0] && y === c[1])) return c;
  }
}

function initState(g: GameKey): State {
  switch (g) {
    case "snake": {
      const cells: [number, number][] = [[8, 9], [7, 9], [6, 9]];
      return { cells, dir: [1, 0], next: [1, 0], food: freeCell(cells), acc: 0, step: 0.14 };
    }
    case "dino":
      return { y: 0, vy: 0, obs: [], speed: 240, spawn: 1.2, t: 0, frame: 0 };
    case "balloon":
      return { list: [], spawn: 0, time: 30, pops: [] };
    case "mole":
      return { hole: -1, up: 0, stay: 1.1, wait: 0.5, time: 30, hit: 0 };
  }
}

export default function GameDemo({ preset }: { preset?: string }) {
  const [game, setGame] = useState<GameKey>(preset && preset in GAMES ? (preset as GameKey) : "snake");
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const canvas = useRef<HTMLCanvasElement>(null);
  const st = useRef<State>(initState(game));
  const scoreRef = useRef(0);
  const phaseRef = useRef<Phase>("ready");
  const mouse = useRef({ x: W / 2, y: H / 2 });

  useEffect(() => {
    setBest(readBest(game));
  }, [game]);

  const addScore = useCallback((d: number) => {
    scoreRef.current = Math.max(0, scoreRef.current + d);
    setScore(scoreRef.current);
  }, []);

  const finish = useCallback(() => {
    phaseRef.current = "over";
    setPhase("over");
    const s = scoreRef.current;
    if (s > readBest(game)) {
      writeBest(game, s);
      setBest(s);
    }
  }, [game]);

  const start = useCallback(() => {
    st.current = initState(game);
    scoreRef.current = 0;
    setScore(0);
    phaseRef.current = "play";
    setPhase("play");
    setTimeLeft(game === "balloon" || game === "mole" ? 30 : null);
    canvas.current?.focus();
  }, [game]);

  function selectGame(g: GameKey) {
    setGame(g);
    st.current = initState(g);
    phaseRef.current = "ready";
    setPhase("ready");
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(g === "balloon" || g === "mole" ? 30 : null);
  }

  const jump = useCallback(() => {
    const s = st.current as DinoState;
    if (s.y <= 0.01) s.vy = 620;
  }, []);

  function onKey(e: React.KeyboardEvent) {
    const k = e.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(k)) e.preventDefault();
    if (phaseRef.current !== "play") {
      if (k === " " || k === "Enter") start();
      return;
    }
    if (game === "snake") {
      const s = st.current as SnakeState;
      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
      };
      const d = map[k];
      if (d && !(d[0] === -s.dir[0] && d[1] === -s.dir[1])) s.next = d;
    }
    if (game === "dino" && (k === " " || k === "ArrowUp")) jump();
  }

  function pos(e: React.PointerEvent) {
    const r = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  }

  function onPointerDown(e: React.PointerEvent) {
    canvas.current?.focus();
    const p = pos(e);
    mouse.current = p;
    if (phaseRef.current !== "play") return;
    if (game === "dino") jump();
    if (game === "balloon") {
      const s = st.current as BalloonState;
      for (let i = s.list.length - 1; i >= 0; i--) {
        const b = s.list[i];
        if (Math.hypot(b.x - p.x, b.y - p.y) < 26) {
          const d = b.kind === "gold" ? 5 : b.kind === "bomb" ? -3 : 1;
          addScore(d);
          s.pops.push({ x: b.x, y: b.y, t: 0.6, text: d > 0 ? `+${d}` : `${d}` });
          s.list.splice(i, 1);
          break;
        }
      }
    }
    if (game === "mole") {
      const s = st.current as MoleState;
      if (s.hole >= 0 && s.up > 0) {
        const [hx, hy] = HOLES[s.hole];
        if (Math.hypot(hx - p.x, hy - 10 - p.y) < 40) {
          addScore(1);
          s.hit = 0.25;
          s.hole = -1;
          s.up = 0;
          s.wait = rand(0.2, 0.6);
          s.stay = Math.max(0.45, 1.1 - scoreRef.current * 0.03);
        }
      }
    }
  }

  // O'yin sikli
  useEffect(() => {
    const ctx = canvas.current!.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
    let lastSec = -1;

    function update(dt: number) {
      if (phaseRef.current !== "play") return;
      if (game === "snake") {
        const s = st.current as SnakeState;
        s.acc += dt;
        while (s.acc >= s.step && phaseRef.current === "play") {
          s.acc -= s.step;
          s.dir = s.next;
          const [hx, hy] = s.cells[0];
          const nh: [number, number] = [hx + s.dir[0], hy + s.dir[1]];
          const hitWall = nh[0] < 0 || nh[1] < 0 || nh[0] >= COLS || nh[1] >= ROWS;
          const hitSelf = s.cells.slice(0, -1).some(([x, y]) => x === nh[0] && y === nh[1]);
          if (hitWall || hitSelf) return finish();
          s.cells.unshift(nh);
          if (nh[0] === s.food[0] && nh[1] === s.food[1]) {
            addScore(1);
            s.food = freeCell(s.cells);
            s.step = Math.max(0.06, s.step - 0.004);
          } else s.cells.pop();
        }
      }
      if (game === "dino") {
        const s = st.current as DinoState;
        s.t += dt;
        s.frame += dt;
        s.vy -= 1900 * dt;
        s.y = Math.max(0, s.y + s.vy * dt);
        if (s.y === 0 && s.vy < 0) s.vy = 0;
        s.speed = 240 + s.t * 12;
        s.spawn -= dt;
        if (s.spawn <= 0) {
          const big = Math.random() < 0.35;
          s.obs.push({ x: W + 30, e: big ? "🪨" : "🌵", w: big ? 30 : 22 });
          s.spawn = rand(0.9, 1.8) * (240 / s.speed) + 0.5;
        }
        s.obs.forEach((o) => (o.x -= s.speed * dt));
        s.obs = s.obs.filter((o) => o.x > -40);
        const newScore = Math.floor(s.t * 10);
        if (newScore !== scoreRef.current) {
          scoreRef.current = newScore;
          setScore(newScore);
        }
        const bearX = 80;
        if (s.obs.some((o) => Math.abs(o.x - bearX) < o.w && s.y < 34)) finish();
      }
      if (game === "balloon") {
        const s = st.current as BalloonState;
        s.time -= dt;
        s.spawn -= dt;
        if (s.spawn <= 0) {
          const r = Math.random();
          s.list.push({ x: rand(30, W - 30), y: H + 30, vy: rand(55, 95) + (30 - s.time) * 2, kind: r < 0.1 ? "gold" : r < 0.22 ? "bomb" : "normal", hue: Math.floor(rand(0, 360)) });
          s.spawn = rand(0.35, 0.75);
        }
        s.list.forEach((b) => (b.y -= b.vy * dt));
        s.list = s.list.filter((b) => b.y > -40);
        s.pops.forEach((p) => (p.t -= dt));
        s.pops = s.pops.filter((p) => p.t > 0);
        if (s.time <= 0) finish();
      }
      if (game === "mole") {
        const s = st.current as MoleState;
        s.time -= dt;
        s.hit = Math.max(0, s.hit - dt);
        if (s.hole >= 0) {
          s.up -= dt;
          if (s.up <= 0) {
            s.hole = -1;
            s.wait = rand(0.2, 0.6);
          }
        } else {
          s.wait -= dt;
          if (s.wait <= 0) {
            s.hole = Math.floor(rand(0, 9));
            s.up = s.stay;
          }
        }
        if (s.time <= 0) finish();
      }
      const t = (st.current as BalloonState | MoleState).time;
      if ((game === "balloon" || game === "mole") && Math.ceil(t) !== lastSec) {
        lastSec = Math.ceil(t);
        setTimeLeft(Math.max(0, lastSec));
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (game === "snake") {
        const s = st.current as SnakeState;
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#243247";
        for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        emoji(ctx, "🍎", s.food[0] * CELL + CELL / 2, s.food[1] * CELL + CELL / 2 + 1, 18);
        s.cells.forEach(([x, y], i) => {
          ctx.fillStyle = i === 0 ? "#22c55e" : i % 2 ? "#16a34a" : "#15803d";
          ctx.beginPath();
          ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 6);
          ctx.fill();
        });
        const [hx, hy] = s.cells[0];
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(hx * CELL + 7 + s.dir[0] * 3, hy * CELL + 7 + s.dir[1] * 3, 2.5, 0, 7);
        ctx.arc(hx * CELL + 13 + s.dir[0] * 3, hy * CELL + 7 + s.dir[1] * 3, 2.5, 0, 7);
        ctx.fill();
      }
      if (game === "dino") {
        const s = st.current as DinoState;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#bae6fd");
        g.addColorStop(1, "#fef3c7");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        emoji(ctx, "☁️", (W - ((s.t * 30) % (W + 100))) + 50, 60, 36);
        emoji(ctx, "☁️", (W - ((s.t * 20 + 250) % (W + 100))) + 50, 100, 28);
        const ground = 290;
        ctx.fillStyle = "#a16207";
        ctx.fillRect(0, ground + 18, W, H - ground);
        ctx.strokeStyle = "#78350f";
        ctx.setLineDash([12, 10]);
        ctx.lineDashOffset = (s.t * s.speed) % 22;
        ctx.beginPath();
        ctx.moveTo(0, ground + 30);
        ctx.lineTo(W, ground + 30);
        ctx.stroke();
        ctx.setLineDash([]);
        s.obs.forEach((o) => emoji(ctx, o.e, o.x, ground, o.w * 1.6));
        const bob = s.y === 0 ? Math.sin(s.frame * 18) * 2 : 0;
        ctx.save();
        ctx.translate(80, ground - s.y + bob);
        ctx.scale(-1, 1);
        emoji(ctx, "🐻", 0, 0, 44);
        ctx.restore();
      }
      if (game === "balloon") {
        const s = st.current as BalloonState;
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#7dd3fc");
        g.addColorStop(1, "#e0f2fe");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        s.list.forEach((b) => {
          if (b.kind === "normal") {
            ctx.save();
            ctx.filter = `hue-rotate(${b.hue}deg)`;
            emoji(ctx, "🎈", b.x, b.y, 44);
            ctx.restore();
          } else emoji(ctx, b.kind === "gold" ? "🌟" : "💣", b.x, b.y, 38);
        });
        s.pops.forEach((p) => {
          ctx.globalAlpha = Math.min(1, p.t * 2);
          ctx.fillStyle = p.text.startsWith("-") ? "#e11d48" : "#16a34a";
          ctx.font = "bold 22px Nunito, sans-serif";
          ctx.fillText(p.text, p.x, p.y - (0.6 - p.t) * 60);
          ctx.globalAlpha = 1;
        });
        const m = mouse.current;
        ctx.strokeStyle = "#e11d48";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 16, 0, 7);
        ctx.moveTo(m.x - 24, m.y);
        ctx.lineTo(m.x + 24, m.y);
        ctx.moveTo(m.x, m.y - 24);
        ctx.lineTo(m.x, m.y + 24);
        ctx.stroke();
      }
      if (game === "mole") {
        const s = st.current as MoleState;
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#22c55e";
        for (let i = 0; i < 40; i++) ctx.fillRect((i * 97) % W, (i * 53) % H, 4, 10);
        HOLES.forEach(([x, y], i) => {
          ctx.fillStyle = "#78350f";
          ctx.beginPath();
          ctx.ellipse(x, y + 18, 44, 16, 0, 0, 7);
          ctx.fill();
          if (i === s.hole) {
            const rise = Math.min(1, (s.stay - s.up) * 8, s.up * 8);
            ctx.save();
            ctx.beginPath();
            ctx.rect(x - 50, y - 60, 100, 78);
            ctx.clip();
            emoji(ctx, "🐹", x, y + 20 - rise * 30, 50);
            ctx.restore();
          }
          ctx.fillStyle = "#422006";
          ctx.beginPath();
          ctx.ellipse(x, y + 22, 40, 10, 0, 0, Math.PI);
          ctx.fill();
        });
        const m = mouse.current;
        ctx.save();
        ctx.translate(m.x + 14, m.y - 10);
        ctx.rotate(s.hit > 0 ? -0.9 : -0.3);
        emoji(ctx, "🔨", 0, 0, 40);
        ctx.restore();
      }
      if (phaseRef.current !== "play") {
        ctx.fillStyle = "rgba(15,23,42,.55)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "900 34px Nunito, sans-serif";
        ctx.fillText(phaseRef.current === "over" ? "O'yin tugadi!" : `${GAMES[game].emoji} ${GAMES[game].title}`, W / 2, H / 2 - 20);
        ctx.font = "700 18px Nunito, sans-serif";
        ctx.fillText(phaseRef.current === "over" ? `Ball: ${scoreRef.current}` : GAMES[game].controls, W / 2, H / 2 + 16);
        ctx.font = "600 14px Nunito, sans-serif";
        ctx.fillText("▶ Start tugmasini bosing (yoki Enter)", W / 2, H / 2 + 46);
      }
    }

    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [game, finish, addScore]);

  const info = GAMES[game];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(GAMES) as GameKey[]).map((g) => (
          <button key={g} onClick={() => selectGame(g)} className={`chip py-1.5 ${g === game ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-800"}`}>
            {GAMES[g].emoji} {GAMES[g].title}
          </button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn-green" onClick={start}>{phase === "play" ? "🔄 Qaytadan" : "▶ Start"}</button>
            <span className="chip bg-indigo-100 py-1 text-sm text-indigo-800" data-testid="game-score">⭐ Ball: {score}</span>
            {timeLeft !== null && <span className="chip bg-amber-100 py-1 text-sm text-amber-800">⏱ {timeLeft} s</span>}
            <span className="chip ml-auto bg-slate-100 py-1 text-sm">🏆 Rekord: {best}</span>
          </div>
          <canvas
            ref={canvas}
            width={W}
            height={H}
            tabIndex={0}
            aria-label={`${info.title} o'yini`}
            onKeyDown={onKey}
            onPointerDown={onPointerDown}
            onPointerMove={(e) => (mouse.current = pos(e))}
            className="w-full touch-none rounded-xl ring-2 ring-slate-300 outline-none focus:ring-rose-400"
            style={{ cursor: game === "balloon" || game === "mole" ? "none" : "pointer" }}
          />
          <p className="text-xs text-slate-500">🎮 Boshqaruv: {info.controls}. O&apos;yin maydonini bir marta bosib oling — shunda klaviatura ishlaydi.</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
          <p className="mb-2 font-black">🧩 Scratch&apos;da qanday qilinadi?</p>
          <ol className="space-y-2 text-sm">
            {info.steps.map((s, i) => (
              <li key={i} className="flex gap-2 rounded-lg bg-white p-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-500 text-xs font-black text-white">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-amber-800">💡 Bu — tayyor namuna. Darsda xuddi shunday o&apos;yinni Scratch&apos;da o&apos;zingiz yig&apos;asiz!</p>
        </div>
      </div>
    </div>
  );
}
