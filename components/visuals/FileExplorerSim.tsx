"use client";

import { useState } from "react";

interface Node {
  id: number;
  name: string;
  type: "folder" | "file" | "zip";
  parent: number | null; // null = Ish stoli
  trashed?: boolean;
}

const icon = (n: Node) => (n.type === "folder" ? "📁" : n.type === "zip" ? "🗜️" : n.name.endsWith(".png") || n.name.endsWith(".jpg") ? "🖼️" : n.name.endsWith(".mp3") ? "🎵" : "📄");

const START: Node[] = [
  { id: 1, name: "Hujjatlar", type: "folder", parent: null },
  { id: 2, name: "mushuk.jpg", type: "file", parent: null },
  { id: 3, name: "qo'shiq.mp3", type: "file", parent: null },
  { id: 4, name: "insho.docx", type: "file", parent: 1 },
];

const MISSIONS: { text: string; check: (n: Node[]) => boolean }[] = [
  { text: "Ish stolida \"Rasmlar\" nomli papka yarating", check: (n) => n.some((x) => x.type === "folder" && x.name.toLowerCase() === "rasmlar" && x.parent === null && !x.trashed) },
  { text: "mushuk.jpg faylini \"Rasmlar\" papkasiga nusxalang (copy → paste)", check: (n) => { const r = n.find((x) => x.name.toLowerCase() === "rasmlar" && !x.trashed); return !!r && n.some((x) => x.parent === r.id && x.name.startsWith("mushuk") && !x.trashed); } },
  { text: "qo'shiq.mp3 faylini \"sevimli.mp3\" deb qayta nomlang", check: (n) => n.some((x) => x.name.toLowerCase() === "sevimli.mp3" && !x.trashed) },
  { text: "\"Hujjatlar\" papkasini ZIP arxivga aylantiring", check: (n) => n.some((x) => x.type === "zip" && x.name.toLowerCase().startsWith("hujjatlar") && !x.trashed) },
  { text: "Ish stolidagi mushuk.jpg ni savatchaga o'chiring", check: (n) => n.some((x) => x.name === "mushuk.jpg" && x.parent === null && x.trashed) },
];

export default function FileExplorerSim() {
  const [nodes, setNodes] = useState<Node[]>(START);
  const [cwd, setCwd] = useState<number | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [clip, setClip] = useState<{ id: number; cut: boolean } | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [nextId, setNextId] = useState(100);
  const [log, setLog] = useState("Faylni tanlash uchun ustiga bosing. Papkani ochish — ikki marta bosing.");

  const here = nodes.filter((n) => (showTrash ? n.trashed : n.parent === cwd && !n.trashed));
  const selected = nodes.find((n) => n.id === sel);
  const path = cwd === null ? "Ish stoli" : `Ish stoli › ${nodes.find((n) => n.id === cwd)?.name}`;

  function uniqueName(name: string, parent: number | null) {
    const taken = nodes.filter((n) => n.parent === parent && !n.trashed).map((n) => n.name);
    if (!taken.includes(name)) return name;
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    let k = 2;
    while (taken.includes(`${base} (${k})${ext}`)) k++;
    return `${base} (${k})${ext}`;
  }

  function add(type: Node["type"], name: string, parent = cwd) {
    const n: Node = { id: nextId, name: uniqueName(name, parent), type, parent };
    setNextId(nextId + 1);
    setNodes((xs) => [...xs, n]);
    return n;
  }

  const actions = {
    newFolder() {
      const name = prompt("Yangi papka nomi:", "Yangi papka");
      if (name) { add("folder", name.trim()); setLog(`📁 "${name}" papkasi yaratildi (Ctrl+Shift+N)`); }
    },
    newFile() {
      const name = prompt("Yangi fayl nomi:", "matn.txt");
      if (name) { add("file", name.trim()); setLog(`📄 "${name}" fayli yaratildi`); }
    },
    rename() {
      if (!selected) return;
      const name = prompt("Yangi nom (F2):", selected.name);
      if (name) { setNodes((xs) => xs.map((x) => (x.id === selected.id ? { ...x, name: name.trim() } : x))); setLog(`✏️ Qayta nomlandi: ${name} (F2)`); }
    },
    copy() { if (selected) { setClip({ id: selected.id, cut: false }); setLog(`📋 Nusxa olindi: ${selected.name} (Ctrl+C)`); } },
    cut() { if (selected) { setClip({ id: selected.id, cut: true }); setLog(`✂️ Kesib olindi: ${selected.name} (Ctrl+X)`); } },
    paste() {
      if (!clip) return;
      const src = nodes.find((n) => n.id === clip.id);
      if (!src) return;
      if (src.type === "folder" && src.id === cwd) return;
      if (clip.cut) {
        setNodes((xs) => xs.map((x) => (x.id === src.id ? { ...x, parent: cwd, name: uniqueName(src.name, cwd) } : x)));
        setClip(null);
        setLog(`📥 Ko'chirildi: ${src.name} (Ctrl+V)`);
      } else {
        add(src.type, src.name);
        setLog(`📥 Qo'yildi: ${src.name} (Ctrl+V)`);
      }
    },
    remove() {
      if (!selected) return;
      setNodes((xs) => xs.map((x) => (x.id === selected.id ? { ...x, trashed: true } : x)));
      setSel(null);
      setLog(`🗑️ Savatchaga tashlandi: ${selected.name} (Delete)`);
    },
    restore() {
      if (!selected) return;
      setNodes((xs) => xs.map((x) => (x.id === selected.id ? { ...x, trashed: false } : x)));
      setSel(null);
      setLog(`♻️ Qayta tiklandi: ${selected.name}`);
    },
    zip() {
      if (!selected) return;
      const base = selected.name.replace(/\.[^.]+$/, "");
      add("zip", `${base}.zip`);
      setLog(`🗜️ Arxivlandi: ${base}.zip (o'ng tugma → Send to → Compressed (zip) folder)`);
    },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-300">
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 text-sm text-white">
          <span className="flex gap-1"><i className="h-3 w-3 rounded-full bg-rose-400" /><i className="h-3 w-3 rounded-full bg-amber-400" /><i className="h-3 w-3 rounded-full bg-emerald-400" /></span>
          <span className="font-bold">Fayl boshqaruvchisi (Explorer)</span>
        </div>
        <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2 text-xs">
          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => { setCwd(null); setShowTrash(false); setSel(null); }} disabled={cwd === null && !showTrash}>⬆️ Orqaga</button>
          {!showTrash && <>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.newFolder}>📁+ Papka</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.newFile}>📄+ Fayl</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.copy} disabled={!selected}>📋 Copy</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.cut} disabled={!selected}>✂️ Cut</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.paste} disabled={!clip}>📥 Paste</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.rename} disabled={!selected}>✏️ Rename</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.zip} disabled={!selected}>🗜️ Zip</button>
            <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.remove} disabled={!selected}>🗑️ Delete</button>
          </>}
          {showTrash && <button className="btn-ghost px-2 py-1 text-xs" onClick={actions.restore} disabled={!selected}>♻️ Tiklash</button>}
        </div>
        <div className="bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">📍 {showTrash ? "Savatcha" : path}</div>
        <div className="grid min-h-56 grid-cols-3 content-start gap-2 bg-gradient-to-br from-sky-100 to-indigo-100 p-4 sm:grid-cols-5" onClick={() => setSel(null)}>
          {here.map((n) => (
            <button
              key={n.id}
              onClick={(e) => { e.stopPropagation(); setSel(n.id); }}
              onDoubleClick={() => { if (n.type === "folder" && !showTrash) { setCwd(n.id); setSel(null); } }}
              className={`flex flex-col items-center rounded-lg p-2 text-center text-xs font-semibold ${sel === n.id ? "bg-indigo-500/30 ring-2 ring-indigo-500" : "hover:bg-white/50"} ${clip?.id === n.id && clip.cut ? "opacity-50" : ""}`}
            >
              <span className="text-4xl">{icon(n)}</span>
              <span className="break-all">{n.name}</span>
            </button>
          ))}
          {!showTrash && cwd === null && (
            <button onClick={(e) => { e.stopPropagation(); setShowTrash(true); setSel(null); }} className="flex flex-col items-center rounded-lg p-2 text-xs font-semibold hover:bg-white/50">
              <span className="text-4xl">🗑️</span>Savatcha ({nodes.filter((n) => n.trashed).length})
            </button>
          )}
          {here.length === 0 && <p className="col-span-full text-center text-slate-500">Bo&apos;sh papka</p>}
        </div>
        <div className="bg-slate-900 px-3 py-2 font-mono text-xs text-emerald-300">{log}</div>
      </div>
      <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
        <p className="mb-2 font-black">🎯 Topshiriqlar</p>
        <ol className="space-y-2 text-sm">
          {MISSIONS.map((m, i) => {
            const ok = m.check(nodes);
            return (
              <li key={i} className={`flex gap-2 rounded-lg p-2 ${ok ? "bg-emerald-200/60" : "bg-white"}`}>
                <span>{ok ? "✅" : "⬜"}</span>
                <span className={ok ? "line-through" : ""}>{m.text}</span>
              </li>
            );
          })}
        </ol>
        <button className="btn-ghost mt-3 text-sm" onClick={() => { setNodes(START); setCwd(null); setSel(null); setClip(null); setShowTrash(false); }}>🔄 Boshidan</button>
      </div>
    </div>
  );
}
