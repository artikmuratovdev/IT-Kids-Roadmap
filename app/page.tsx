import Link from "next/link";
import { catalogWeeks, lessons, months } from "@/content";
import { theme } from "@/lib/theme";

export default function Home() {
  const weeks = catalogWeeks();
  const totalQuestions = lessons.reduce((s, l) => s + l.quiz.length, 0);
  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-8 text-white shadow-lg sm:p-12">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-indigo-100">6 oylik kurs · haftasiga 3 dars × 80 daqiqa</p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">IT Kids — kompyuterdan veb-saytgacha! 🚀</h1>
        <p className="mt-4 max-w-2xl text-lg text-indigo-50">
          Har bir dars uchun tushunchalar, interaktiv ko&apos;rgazmalar, amaliy topshiriqlar va test. O&apos;qituvchi darsni
          ekranda ko&apos;rsatadi, o&apos;quvchilar esa testni shu yerning o&apos;zida topshiradi.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/darslar" className="btn bg-white text-indigo-700 hover:bg-indigo-50">📚 Darslarni ko&apos;rish</Link>
          <Link href="/login" className="btn bg-indigo-900/40 text-white ring-1 ring-white/40 hover:bg-indigo-900/60">Kirish</Link>
        </div>
        <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-center">
          {[
            [lessons.length, "dars"],
            [totalQuestions, "test savoli"],
            [10, "interaktiv ko'rgazma"],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl bg-white/15 p-3">
              <div className="text-3xl font-black">{n}</div>
              <div className="text-sm text-indigo-100">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black">🗺️ Kurs yo&apos;l xaritasi</h2>
        <ol className="relative space-y-6 border-l-4 border-dashed border-slate-200 pl-6">
          {months.map((m) => {
            const t = theme(m.num);
            return (
              <li key={m.num} className="relative">
                <span className={`absolute -left-[42px] grid h-9 w-9 place-items-center rounded-full ${t.bg} text-lg text-white shadow`}>{m.num}</span>
                <div className="card p-5">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-xl font-black">{m.emoji} {m.num}-oy: {m.title}</h3>
                    <span className="text-sm text-slate-500">{m.summary}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {weeks.filter((w) => w.month === m.num).map((w) => (
                      <div key={w.week} className={`rounded-xl border ${t.border} ${t.soft} p-3`}>
                        <div className={`text-xs font-black uppercase ${t.text}`}>{w.week}-hafta</div>
                        <div className="mb-2 font-bold leading-tight">{w.title}</div>
                        <ul className="space-y-1 text-sm">
                          {w.lessons.map((l) => (
                            <li key={l.id}>
                              <Link href={`/darslar/${l.id}`} className="block rounded-lg px-1.5 py-0.5 hover:bg-white">
                                <span className="text-slate-400">{l.day}.</span> {l.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
