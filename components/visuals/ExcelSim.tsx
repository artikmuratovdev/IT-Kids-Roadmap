"use client";

import { useMemo, useState } from "react";
import { evaluateSheet, expandRange, fmt, indexToCol, FormulaError, type Sheet } from "@/lib/excel-formula";

const COLS = 6;
const ROWS = 12;

interface Preset {
  title: string;
  sheet: Sheet;
  tasks: { text: string; cell: string; expect: string }[];
}

const PRESETS: Record<string, Preset> = {
  basic: {
    title: "Do'kon ro'yxati",
    sheet: {
      A1: "Mahsulot", B1: "Narxi", C1: "Soni", D1: "Jami",
      A2: "Olma", B2: "5000", C2: "3", D2: "=B2*C2",
      A3: "Non", B3: "4000", C3: "2",
      A4: "Sut", B4: "12000", C4: "1",
      A5: "Shokolad", B5: "8000", C5: "4",
      A7: "Umumiy:",
    },
    tasks: [
      { text: "D3 ga non uchun jami narxni hisoblang (=B3*C3)", cell: "D3", expect: "8000" },
      { text: "D4 va D5 ni ham to'ldiring", cell: "D5", expect: "32000" },
      { text: "D7 ga hammasini qo'shing: =D2+D3+D4+D5", cell: "D7", expect: "67000" },
      { text: "C7 ga nechta mahsulot olinganini hisoblang", cell: "C7", expect: "10" },
    ],
  },
  functions: {
    title: "Sinf ballari",
    sheet: {
      A1: "O'quvchi", B1: "Matem", C1: "Ona tili", D1: "Jami", E1: "O'rtacha",
      A2: "Ali", B2: "85", C2: "92",
      A3: "Malika", B3: "97", C3: "88",
      A4: "Sardor", B4: "64", C4: "71",
      A5: "Zarina", B5: "78", C5: "95",
      A6: "Bekzod", B6: "91", C6: "59",
      A8: "Eng katta:", A9: "Eng kichik:", A10: "Nechta:",
      D2: "=SUM(B2:C2)",
    },
    tasks: [
      { text: "D6 gacha jami ballarni SUM bilan hisoblang", cell: "D6", expect: "150" },
      { text: "E2 ga Alining o'rtacha bahosi: =AVERAGE(B2:C2)", cell: "E2", expect: "88.5" },
      { text: "B8 ga matematikadan eng katta ball: =MAX(B2:B6)", cell: "B8", expect: "97" },
      { text: "B9 ga matematikadan eng kichik ball: =MIN(B2:B6)", cell: "B9", expect: "64" },
      { text: "B10 ga nechta o'quvchi borligini sanang: =COUNT(B2:B6)", cell: "B10", expect: "5" },
    ],
  },
  if: {
    title: "Shartli hisoblash",
    sheet: {
      A1: "O'quvchi", B1: "Jins", C1: "Ball", D1: "Natija",
      A2: "Ali", B2: "o'g'il", C2: "92", D2: '=IF(C2>=90;"A\'lo";"Yaxshi")',
      A3: "Malika", B3: "qiz", C3: "97",
      A4: "Sardor", B4: "o'g'il", C4: "64",
      A5: "Zarina", B5: "qiz", C5: "88",
      A6: "Bekzod", B6: "o'g'il", C6: "59",
      A8: "A'lochilar:", A9: "Qizlar balli:", A10: "O'rtacha:",
    },
    tasks: [
      { text: "D3 ga: 90 va undan ko'p bo'lsa \"A'lo\", aks holda \"Yaxshi\"", cell: "D3", expect: "A'lo" },
      { text: "D6 ga: 60 dan kam bo'lsa \"Yana urin\", aks holda \"O'tdi\"", cell: "D6", expect: "Yana urin" },
      { text: "C8 ga nechta ball 90 va undan yuqori: =COUNTIF(C2:C6;\">=90\")", cell: "C8", expect: "2" },
      { text: "C9 ga faqat qizlarning ballari: =SUMIF(B2:B6;\"qiz\";C2:C6)", cell: "C9", expect: "185" },
      { text: "C10 ga o'rtacha, 1 xonagacha: =ROUND(AVERAGE(C2:C6);1)", cell: "C10", expect: "80" },
    ],
  },
};

function refsIn(formula: string): string[] {
  if (!formula.startsWith("=")) return [];
  const out: string[] = [];
  const re = /([A-Za-z]+[0-9]+)(?::([A-Za-z]+[0-9]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(formula))) {
    const a = m[1].toUpperCase();
    if (!/^[A-Z]{1,2}[0-9]{1,3}$/.test(a)) continue;
    if (m[2]) out.push(...expandRange(a, m[2].toUpperCase()));
    else out.push(a);
  }
  return out;
}

export default function ExcelSim({ preset }: { preset?: string }) {
  const keys = Object.keys(PRESETS);
  const [pk, setPk] = useState(preset && PRESETS[preset] ? preset : "basic");
  const [sheet, setSheet] = useState<Sheet>(PRESETS[pk].sheet);
  const [sel, setSel] = useState("D2");
  const [draft, setDraft] = useState(PRESETS[pk].sheet["D2"] ?? "");

  const values = useMemo(() => evaluateSheet(sheet), [sheet]);
  const highlighted = useMemo(() => new Set(refsIn(sheet[sel] ?? "")), [sheet, sel]);
  const err = values[sel] instanceof FormulaError ? (values[sel] as FormulaError).message : null;

  function choose(ref: string) {
    setSel(ref);
    setDraft(sheet[ref] ?? "");
  }
  function commit(v = draft) {
    setSheet((s) => ({ ...s, [sel]: v }));
  }
  function loadPreset(k: string) {
    setPk(k);
    setSheet(PRESETS[k].sheet);
    setSel("A1");
    setDraft(PRESETS[k].sheet.A1 ?? "");
  }
  function moveSel(dc: number, dr: number) {
    const m = /^([A-Z]+)([0-9]+)$/.exec(sel)!;
    const c = Math.max(0, Math.min(COLS - 1, m[1].charCodeAt(0) - 65 + dc));
    const r = Math.max(1, Math.min(ROWS, +m[2] + dr));
    choose(`${indexToCol(c)}${r}`);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
      <div className="overflow-hidden rounded-xl ring-1 ring-emerald-700/30">
        <div className="flex flex-wrap items-center gap-2 bg-emerald-700 px-3 py-2 text-sm text-white">
          <b>📊 Mini Excel</b>
          {keys.map((k) => (
            <button key={k} onClick={() => loadPreset(k)} className={`chip py-1 ${pk === k ? "bg-white text-emerald-800" : "bg-emerald-600"}`}>{PRESETS[k].title}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-2">
          <span className="w-12 rounded bg-white px-2 py-1 text-center font-mono text-sm font-bold ring-1 ring-slate-300">{sel}</span>
          <span className="font-serif italic text-slate-500">fx</span>
          <input
            className="input py-1 font-mono text-sm"
            value={draft}
            placeholder="Qiymat yoki formula (= bilan boshlanadi)"
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit()}
            onKeyDown={(e) => {
              if (e.key === "Enter") { commit(); moveSel(0, 1); }
              if (e.key === "Tab") { e.preventDefault(); commit(); moveSel(1, 0); }
            }}
            aria-label="Formula satri"
          />
        </div>
        <div className="overflow-x-auto bg-white">
          <table className="w-full border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className="w-8 border border-slate-200 bg-slate-100" />
                {Array.from({ length: COLS }, (_, c) => (
                  <th key={c} className="min-w-20 border border-slate-200 bg-slate-100 py-1 text-xs text-slate-600">{indexToCol(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }, (_, r) => (
                <tr key={r}>
                  <td className="border border-slate-200 bg-slate-100 text-center text-xs text-slate-600">{r + 1}</td>
                  {Array.from({ length: COLS }, (_, c) => {
                    const ref = `${indexToCol(c)}${r + 1}`;
                    const v = values[ref];
                    const isErr = v instanceof FormulaError;
                    return (
                      <td
                        key={ref}
                        onClick={() => choose(ref)}
                        className={`cursor-cell border px-2 py-1 ${sel === ref ? "border-2 border-emerald-600" : "border-slate-200"} ${highlighted.has(ref) ? "bg-sky-100" : ""} ${r === 0 ? "font-bold" : ""} ${typeof v === "number" ? "text-right" : ""} ${isErr ? "text-rose-600" : ""} ${(sheet[ref] ?? "").startsWith("=") ? "text-emerald-800" : ""}`}
                      >
                        {fmt(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {err && <p className="bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">⚠️ {err}</p>}
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
          <p className="mb-2 font-black">🎯 Mashqlar: {PRESETS[pk].title}</p>
          <ol className="space-y-2 text-sm">
            {PRESETS[pk].tasks.map((t, i) => {
              const ok = fmt(values[t.cell]) === t.expect;
              return (
                <li key={i} className={`flex gap-2 rounded-lg p-2 ${ok ? "bg-emerald-200/60" : "bg-white"}`}>
                  <span>{ok ? "✅" : "⬜"}</span>
                  <button className="text-left" onClick={() => choose(t.cell)}>{t.text}</button>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm ring-1 ring-slate-200">
          <p className="mb-1 font-black">📖 Eslatma</p>
          <ul className="space-y-1 font-mono text-xs">
            <li>=A1+B1 · =A1*B1 · =A1/B1</li>
            <li>=SUM(A1:A5) — СУММ</li>
            <li>=AVERAGE(...) — СРЗНАЧ</li>
            <li>=MAX(...) / =MIN(...) — МАКС / МИН</li>
            <li>=COUNT(...) — СЧЁТ</li>
            <li>=IF(A1&gt;=90;&quot;A&apos;lo&quot;;&quot;Yaxshi&quot;) — ЕСЛИ</li>
            <li>=COUNTIF(A1:A5;&quot;&gt;=90&quot;) — СЧЁТЕСЛИ</li>
            <li>=SUMIF(B:B;&quot;qiz&quot;;C:C) — СУММЕСЛИ</li>
            <li>=ROUND(A1;1) — ОКРУГЛ</li>
          </ul>
          <p className="mt-2 text-xs text-slate-500">Formula tanlanganda u foydalanayotgan kataklar 🟦 ko&apos;k rangda yonadi.</p>
        </div>
      </div>
    </div>
  );
}
