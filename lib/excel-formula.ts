/**
 * Kichik Excel formula hisoblagichi (bolalar uchun simulyator).
 * Qo'llab-quvvatlanadi: + - * / ^ &, taqqoslash (= <> < > <= >=),
 * A1 va A1:B3 havolalar, SUM, AVERAGE, MAX, MIN, COUNT, IF, COUNTIF,
 * SUMIF, ROUND, CONCATENATE (ruscha nomlari ham: СУММ, СРЗНАЧ, ...).
 */

export type CellValue = number | string | boolean;
export type Sheet = Record<string, string>; // "A1" -> xom kiritilgan qiymat

export class FormulaError extends Error {}

const ALIASES: Record<string, string> = {
  СУММ: "SUM",
  СРЗНАЧ: "AVERAGE",
  МАКС: "MAX",
  МИН: "MIN",
  СЧЁТ: "COUNT",
  СЧЕТ: "COUNT",
  ЕСЛИ: "IF",
  СЧЁТЕСЛИ: "COUNTIF",
  СЧЕТЕСЛИ: "COUNTIF",
  СУММЕСЛИ: "SUMIF",
  ОКРУГЛ: "ROUND",
  СЦЕПИТЬ: "CONCATENATE",
};

type Token =
  | { t: "num"; v: number }
  | { t: "str"; v: string }
  | { t: "ref"; v: string }
  | { t: "range"; from: string; to: string }
  | { t: "fn"; v: string }
  | { t: "op"; v: string }
  | { t: "(" }
  | { t: ")" }
  | { t: "," };

function tokenize(src: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === " ") { i++; continue; }
    if (c === '"') {
      const end = src.indexOf('"', i + 1);
      if (end < 0) throw new FormulaError("Qo'shtirnoq yopilmagan");
      out.push({ t: "str", v: src.slice(i + 1, end) });
      i = end + 1;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]+/.exec(src.slice(i))!;
      out.push({ t: "num", v: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    const word = /^[A-Za-zА-Яа-яЁё]+[0-9]*/.exec(src.slice(i));
    if (word) {
      const w = word[0].toUpperCase();
      i += word[0].length;
      if (/^[A-Z]+[0-9]+$/.test(w)) {
        if (src[i] === ":") {
          const m2 = /^[A-Za-z]+[0-9]+/.exec(src.slice(i + 1));
          if (!m2) throw new FormulaError("Diapazon noto'g'ri");
          out.push({ t: "range", from: w, to: m2[0].toUpperCase() });
          i += 1 + m2[0].length;
        } else out.push({ t: "ref", v: w });
      } else if (w === "TRUE" || w === "FALSE") {
        out.push({ t: "num", v: w === "TRUE" ? 1 : 0 });
      } else out.push({ t: "fn", v: ALIASES[w] ?? w });
      continue;
    }
    const two = src.slice(i, i + 2);
    if (two === "<=" || two === ">=" || two === "<>") { out.push({ t: "op", v: two }); i += 2; continue; }
    if ("+-*/^&=<>".includes(c)) { out.push({ t: "op", v: c }); i++; continue; }
    if (c === "(") { out.push({ t: "(" }); i++; continue; }
    if (c === ")") { out.push({ t: ")" }); i++; continue; }
    if (c === "," || c === ";") { out.push({ t: "," }); i++; continue; }
    throw new FormulaError(`Noma'lum belgi: ${c}`);
  }
  return out;
}

type Node =
  | { k: "val"; v: CellValue }
  | { k: "ref"; v: string }
  | { k: "range"; from: string; to: string }
  | { k: "bin"; op: string; a: Node; b: Node }
  | { k: "neg"; a: Node }
  | { k: "call"; fn: string; args: Node[] };

function parse(tokens: Token[]): Node {
  let p = 0;
  const peek = () => tokens[p];
  const next = () => tokens[p++];

  const PREC: Record<string, number> = { "=": 1, "<>": 1, "<": 1, ">": 1, "<=": 1, ">=": 1, "&": 2, "+": 3, "-": 3, "*": 4, "/": 4, "^": 5 };

  function primary(): Node {
    const tk = next();
    if (!tk) throw new FormulaError("Formula tugallanmagan");
    switch (tk.t) {
      case "num": return { k: "val", v: tk.v };
      case "str": return { k: "val", v: tk.v };
      case "ref": return { k: "ref", v: tk.v };
      case "range": return { k: "range", from: tk.from, to: tk.to };
      case "op":
        if (tk.v === "-") return { k: "neg", a: expr(5) };
        if (tk.v === "+") return expr(5);
        break;
      case "(": {
        const e = expr(0);
        if (next()?.t !== ")") throw new FormulaError("Qavs yopilmagan");
        return e;
      }
      case "fn": {
        if (next()?.t !== "(") throw new FormulaError(`${tk.v} dan keyin ( kerak`);
        const args: Node[] = [];
        if (peek()?.t !== ")") {
          for (;;) {
            args.push(expr(0));
            if (peek()?.t === ",") { p++; continue; }
            break;
          }
        }
        if (next()?.t !== ")") throw new FormulaError("Qavs yopilmagan");
        return { k: "call", fn: tk.v, args };
      }
    }
    throw new FormulaError("Formula noto'g'ri yozilgan");
  }

  function expr(minPrec: number): Node {
    let left = primary();
    for (;;) {
      const tk = peek();
      if (!tk || tk.t !== "op") break;
      const prec = PREC[tk.v];
      if (prec === undefined || prec < minPrec) break;
      p++;
      const right = expr(tk.v === "^" ? prec : prec + 1);
      left = { k: "bin", op: tk.v, a: left, b: right };
    }
    return left;
  }

  const tree = expr(0);
  if (p < tokens.length) throw new FormulaError("Formula oxirida ortiqcha belgilar bor");
  return tree;
}

export function colToIndex(col: string): number {
  let n = 0;
  for (const ch of col) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function indexToCol(i: number): string {
  let s = "";
  i += 1;
  while (i > 0) {
    const r = (i - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function splitRef(ref: string): [number, number] {
  const m = /^([A-Z]+)([0-9]+)$/.exec(ref);
  if (!m) throw new FormulaError(`Noto'g'ri katak: ${ref}`);
  return [colToIndex(m[1]), parseInt(m[2], 10)];
}

export function expandRange(from: string, to: string): string[] {
  const [c1, r1] = splitRef(from);
  const [c2, r2] = splitRef(to);
  const refs: string[] = [];
  for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) refs.push(`${indexToCol(c)}${r}`);
  return refs;
}

function toNum(v: CellValue): number {
  if (typeof v === "number") return v;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (v === "") return 0;
  const n = Number(v);
  if (Number.isNaN(n)) throw new FormulaError(`"${v}" son emas`);
  return n;
}

function matchCriteria(value: CellValue, criteria: CellValue): boolean {
  if (typeof criteria === "number") return typeof value === "number" && value === criteria;
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(String(criteria))!;
  const op = m[1] ?? "=";
  const rhsRaw = m[2];
  const rhsNum = Number(rhsRaw);
  const numeric = rhsRaw !== "" && !Number.isNaN(rhsNum);
  if (numeric && typeof value === "number") {
    switch (op) {
      case "=": return value === rhsNum;
      case "<>": return value !== rhsNum;
      case "<": return value < rhsNum;
      case ">": return value > rhsNum;
      case "<=": return value <= rhsNum;
      case ">=": return value >= rhsNum;
    }
  }
  const a = String(value).toLowerCase();
  const b = rhsRaw.toLowerCase();
  return op === "<>" ? a !== b : op === "=" ? a === b : false;
}

export function evaluateSheet(sheet: Sheet): Record<string, CellValue | FormulaError> {
  const cache: Record<string, CellValue | FormulaError> = {};
  const visiting = new Set<string>();

  function cell(ref: string): CellValue {
    if (ref in cache) {
      const v = cache[ref];
      if (v instanceof FormulaError) throw v;
      return v;
    }
    if (visiting.has(ref)) throw new FormulaError("Aylanma havola (formula o'ziga qaraydi)");
    visiting.add(ref);
    try {
      const v = evalRaw(sheet[ref] ?? "");
      cache[ref] = v;
      return v;
    } catch (e) {
      const err = e instanceof FormulaError ? e : new FormulaError(String(e));
      cache[ref] = err;
      throw err;
    } finally {
      visiting.delete(ref);
    }
  }

  function flatten(nodes: Node[]): CellValue[] {
    const vals: CellValue[] = [];
    for (const n of nodes) {
      if (n.k === "range") for (const r of expandRange(n.from, n.to)) {
        const raw = sheet[r];
        if (raw !== undefined && raw !== "") vals.push(cell(r));
      }
      else vals.push(ev(n));
    }
    return vals;
  }

  function rangeRefs(n: Node): string[] {
    if (n.k === "range") return expandRange(n.from, n.to);
    if (n.k === "ref") return [n.v];
    throw new FormulaError("Bu yerda diapazon kerak (masalan A1:A5)");
  }

  function ev(n: Node): CellValue {
    switch (n.k) {
      case "val": return n.v;
      case "ref": return cell(n.v);
      case "range": throw new FormulaError("Diapazonni faqat funksiya ichida ishlating");
      case "neg": return -toNum(ev(n.a));
      case "bin": {
        const a = ev(n.a);
        const b = ev(n.b);
        switch (n.op) {
          case "+": return toNum(a) + toNum(b);
          case "-": return toNum(a) - toNum(b);
          case "*": return toNum(a) * toNum(b);
          case "/": {
            const d = toNum(b);
            if (d === 0) throw new FormulaError("Nolga bo'lib bo'lmaydi (#DIV/0!)");
            return toNum(a) / d;
          }
          case "^": return Math.pow(toNum(a), toNum(b));
          case "&": return `${fmt(a)}${fmt(b)}`;
          case "=": return a === b || (typeof a === "string" && typeof b === "string" && a.toLowerCase() === b.toLowerCase());
          case "<>": return a !== b;
          case "<": return toNum(a) < toNum(b);
          case ">": return toNum(a) > toNum(b);
          case "<=": return toNum(a) <= toNum(b);
          case ">=": return toNum(a) >= toNum(b);
        }
        throw new FormulaError(`Noma'lum amal ${n.op}`);
      }
      case "call": {
        const nums = () => flatten(n.args).filter((v) => typeof v === "number") as number[];
        switch (n.fn) {
          case "SUM": return nums().reduce((s, x) => s + x, 0);
          case "AVERAGE": {
            const xs = nums();
            if (!xs.length) throw new FormulaError("O'rtacha uchun son yo'q (#DIV/0!)");
            return xs.reduce((s, x) => s + x, 0) / xs.length;
          }
          case "MAX": { const xs = nums(); return xs.length ? Math.max(...xs) : 0; }
          case "MIN": { const xs = nums(); return xs.length ? Math.min(...xs) : 0; }
          case "COUNT": return nums().length;
          case "IF": {
            if (n.args.length < 2) throw new FormulaError("IF uchun kamida 2 ta qism kerak");
            const cond = ev(n.args[0]);
            const truthy = typeof cond === "string" ? cond !== "" : Boolean(toNum(cond));
            if (truthy) return ev(n.args[1]);
            return n.args[2] ? ev(n.args[2]) : false;
          }
          case "COUNTIF": {
            if (n.args.length !== 2) throw new FormulaError("COUNTIF(diapazon; shart)");
            const crit = ev(n.args[1]);
            return rangeRefs(n.args[0]).filter((r) => (sheet[r] ?? "") !== "" && matchCriteria(cell(r), crit)).length;
          }
          case "SUMIF": {
            if (n.args.length < 2) throw new FormulaError("SUMIF(diapazon; shart; [qo'shiladigan diapazon])");
            const crit = ev(n.args[1]);
            const refs = rangeRefs(n.args[0]);
            const sumRefs = n.args[2] ? rangeRefs(n.args[2]) : refs;
            let s = 0;
            refs.forEach((r, i) => {
              if ((sheet[r] ?? "") !== "" && matchCriteria(cell(r), crit)) {
                const v = sumRefs[i] ? cell(sumRefs[i]) : 0;
                if (typeof v === "number") s += v;
              }
            });
            return s;
          }
          case "ROUND": {
            const x = toNum(ev(n.args[0]));
            const d = n.args[1] ? toNum(ev(n.args[1])) : 0;
            const f = Math.pow(10, d);
            return Math.round(x * f) / f;
          }
          case "CONCATENATE": return flatten(n.args).map(fmt).join("");
        }
        throw new FormulaError(`Noma'lum funksiya: ${n.fn}`);
      }
    }
  }

  function evalRaw(raw: string): CellValue {
    const s = raw.trim();
    if (s.startsWith("=")) return ev(parse(tokenize(s.slice(1))));
    if (s === "") return "";
    const n = Number(s);
    return Number.isNaN(n) ? raw : n;
  }

  for (const ref of Object.keys(sheet)) {
    try { cell(ref); } catch { /* xato cache ichida saqlanadi */ }
  }
  return cache;
}

export function fmt(v: CellValue | FormulaError | undefined): string {
  if (v === undefined) return "";
  if (v instanceof FormulaError) return "#XATO";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000);
  return v;
}
