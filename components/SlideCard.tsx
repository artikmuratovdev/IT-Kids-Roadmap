import type { Slide } from "@/content/types";

export function SlideCard({ slide, big = false }: { slide: Slide; big?: boolean }) {
  return (
    <div className={big ? "space-y-6" : "space-y-3"}>
      <h3 className={`font-black leading-tight ${big ? "text-4xl md:text-6xl" : "text-lg"}`}>
        {slide.emoji && <span className="mr-2">{slide.emoji}</span>}
        {slide.title}
      </h3>
      <ul className={`space-y-2 ${big ? "text-2xl md:text-3xl" : "text-[15px]"}`}>
        {slide.points.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className={big ? "text-indigo-400" : "text-indigo-500"}>●</span>
            <span dangerouslySetInnerHTML={{ __html: inline(p) }} />
          </li>
        ))}
      </ul>
      {slide.code && (
        <pre className={`overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-emerald-300 ${big ? "text-2xl" : "text-sm"}`}>
          {slide.code}
        </pre>
      )}
      {slide.tip && (
        <p className={`rounded-xl bg-amber-50 p-3 font-semibold text-amber-900 ${big ? "text-2xl" : "text-sm"}`}>💡 {slide.tip}</p>
      )}
    </div>
  );
}

/** **qalin** va `kod` belgilarini oddiy HTML'ga aylantiradi (kontent bizniki, lekin baribir escape qilamiz). */
export function inline(s: string): string {
  const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-slate-100 px-1 font-mono text-[0.9em] text-rose-600">$1</code>');
}
