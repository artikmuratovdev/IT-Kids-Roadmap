"use client";

import { useEffect, useState } from "react";

const SAMPLES: Record<string, { title: string; html: string; css: string }> = {
  html: {
    title: "HTML asoslari",
    html: `<h1>Salom, men Ali!</h1>
<p>Men 10 yoshdaman va <b>dasturlashni</b> yaxshi ko'raman.</p>
<h2>Sevimli narsalarim</h2>
<p>Futbol, kitob va kompyuter o'yinlari.</p>
<img src="https://picsum.photos/seed/itkids/300/160" alt="rasm">
<p><a href="https://scratch.mit.edu" target="_blank">Scratch saytiga o'tish</a></p>`,
    css: ``,
  },
  list: {
    title: "Ro'yxat va jadval",
    html: `<h1>Mening hobbilarim</h1>
<ul>
  <li>⚽ Futbol</li>
  <li>🎨 Rasm chizish</li>
  <li>💻 Dasturlash</li>
</ul>
<h2>Dars jadvalim</h2>
<table border="1">
  <tr><th>Kun</th><th>Fan</th></tr>
  <tr><td>Dushanba</td><td>Matematika</td></tr>
  <tr><td>Chorshanba</td><td>IT Kids</td></tr>
</table>`,
    css: ``,
  },
  css: {
    title: "CSS bilan bezash",
    html: `<div class="karta">
  <h1>Mening sahifam</h1>
  <p>CSS yordamida sahifani chiroyli qilamiz!</p>
  <button>Bos meni</button>
</div>`,
    css: `body {
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  font-family: Arial, sans-serif;
}
.karta {
  background: white;
  padding: 24px;
  border-radius: 16px;
  max-width: 320px;
  margin: 40px auto;
  text-align: center;
}
h1 { color: #7c3aed; }
button {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 999px;
  font-size: 18px;
}`,
  },
  form: {
    title: "Forma",
    html: `<form>
  <h2>Ro'yxatdan o'tish</h2>
  <label>Ism: <input type="text" placeholder="Ismingiz"></label>
  <label>Email: <input type="email" placeholder="email@misol.uz"></label>
  <label>Yosh: <input type="number" min="6" max="16"></label>
  <button type="submit">Yuborish</button>
</form>`,
    css: `form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
  margin: 20px auto;
  padding: 20px;
  border-radius: 12px;
  background: #ecfeff;
  font-family: sans-serif;
}
input { padding: 8px; border-radius: 8px; border: 1px solid #94a3b8; }
button { padding: 10px; background: #0891b2; color: white; border: 0; border-radius: 8px; }`,
  },
  media: {
    title: "Rasm va video",
    html: `<h1>Onlayn galereya</h1>
<div class="galereya">
  <img src="https://picsum.photos/seed/a/200/140" alt="1">
  <img src="https://picsum.photos/seed/b/200/140" alt="2">
  <img src="https://picsum.photos/seed/c/200/140" alt="3">
</div>
<h2>Video</h2>
<video controls width="320" src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video>`,
    css: `body { font-family: sans-serif; text-align: center; }
.galereya { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.galereya img { border-radius: 12px; transition: transform .3s; }
.galereya img:hover { transform: scale(1.1); }`,
  },
  portfolio: {
    title: "Portfolio",
    html: `<header>
  <h1>👋 Men — Malika</h1>
  <p>Yosh dasturchi va dizayner</p>
</header>
<section>
  <h2>Loyihalarim</h2>
  <div class="loyihalar">
    <div class="loyiha">🐱 Scratch o'yin</div>
    <div class="loyiha">🎨 Poster dizayn</div>
    <div class="loyiha">🌐 Hobbi sahifa</div>
  </div>
</section>
<footer>© 2026 Malika</footer>`,
    css: `body { margin: 0; font-family: sans-serif; background: #f8fafc; }
header { background: #4f46e5; color: white; padding: 30px; text-align: center; }
section { padding: 20px; }
.loyihalar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.loyiha { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px #0001; text-align: center; }
footer { text-align: center; color: #64748b; padding: 12px; }`,
  },
};

const TAGS = ["<h1></h1>", "<p></p>", "<b></b>", "<img src=\"\" alt=\"\">", "<a href=\"\"></a>", "<ul><li></li></ul>", "<br>"];

export default function CodePlayground({ preset }: { preset?: string }) {
  const [key, setKey] = useState(preset && SAMPLES[preset] ? preset : "html");
  const [html, setHtml] = useState(SAMPLES[key].html);
  const [css, setCss] = useState(SAMPLES[key].css);
  const [tab, setTab] = useState<"html" | "css">("html");
  const [doc, setDoc] = useState("");

  useEffect(() => {
    const h = setTimeout(() => setDoc(`<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`), 250);
    return () => clearTimeout(h);
  }, [html, css]);

  function load(k: string) {
    setKey(k);
    setHtml(SAMPLES[k].html);
    setCss(SAMPLES[k].css);
    setTab("html");
  }

  function download() {
    const blob = new Blob([doc], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "index.html";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {Object.entries(SAMPLES).map(([k, s]) => (
          <button key={k} onClick={() => load(k)} className={`chip py-1 ${key === k ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>{s.title}</button>
        ))}
        <button className="chip ml-auto bg-slate-800 py-1 text-white" onClick={download}>💾 index.html yuklab olish</button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl bg-slate-900 ring-1 ring-slate-700">
          <div className="flex bg-slate-800 text-sm">
            {(["html", "css"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 font-bold ${tab === t ? "bg-slate-900 text-white" : "text-slate-400"}`}>
                {t === "html" ? "📄 index.html" : "🎨 style.css"}
              </button>
            ))}
          </div>
          {tab === "html" && (
            <div className="flex flex-wrap gap-1 border-b border-slate-700 p-1.5">
              {TAGS.map((t) => (
                <button key={t} onClick={() => setHtml(html + "\n" + t)} className="rounded bg-slate-700 px-1.5 py-0.5 font-mono text-xs text-sky-300 hover:bg-slate-600">{t}</button>
              ))}
            </div>
          )}
          <textarea
            value={tab === "html" ? html : css}
            onChange={(e) => (tab === "html" ? setHtml(e.target.value) : setCss(e.target.value))}
            spellCheck={false}
            className="h-80 w-full resize-y bg-slate-900 p-3 font-mono text-sm leading-relaxed text-emerald-200 outline-none"
            aria-label={tab === "html" ? "HTML kod" : "CSS kod"}
            onKeyDown={(e) => {
              if (e.key === "Tab") {
                e.preventDefault();
                const el = e.currentTarget;
                const s = el.selectionStart;
                const v = el.value.slice(0, s) + "  " + el.value.slice(el.selectionEnd);
                if (tab === "html") setHtml(v); else setCss(v);
                requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
              }
            }}
          />
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-300">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 text-xs text-slate-500">
            <span className="flex gap-1"><i className="h-2.5 w-2.5 rounded-full bg-rose-400" /><i className="h-2.5 w-2.5 rounded-full bg-amber-400" /><i className="h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
            <span className="flex-1 rounded bg-white px-2 py-0.5">🔒 mening-saytim.uz</span>
          </div>
          <iframe title="Natija" srcDoc={doc} sandbox="allow-scripts" className="h-[23.5rem] w-full bg-white" />
        </div>
      </div>
      <p className="text-sm text-slate-500">💡 Chapda kod yozing — o&apos;ngda natija darhol ko&apos;rinadi. Tayyor bo&apos;lgach, <b>index.html</b> ni yuklab olib, brauzerda oching!</p>
    </div>
  );
}
