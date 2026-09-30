# IT Kids — o'quv platformasi

6 oylik **"IT Kids"** kursi (72 dars, haftasiga 3 × 80 daqiqa) uchun veb-platforma:

- 📚 **72 ta dars materiali** — tushuncha slaydlari, sinf ishi (qadamma-qadam), uy vazifasi, loyiha darslari uchun baholash mezonlari.
- 📝 **Har dars uchun test** (5–7 savol, izohlar bilan) — jami 400+ savol. Javoblar serverda baholanadi, to'g'ri javoblar brauzerga yuborilmaydi.
- 🕹️ **10 ta interaktiv ko'rgazma**: kompyuter qismlari, fayl boshqaruvchisi, mini-Paint, mini-Excel (formulalar), CapCut vaqt chizig'i, AI prompt konstruktori, tez yozish testi, Scratch bloklari jumbog'i, 4 ta o'ynaladigan o'yin namunasi (Snake, ayiqli Dino, Balloon shooter, Mole strike), HTML/CSS jonli muharrir.
- 🧑‍🏫 **O'qituvchi paneli** — guruhlar va guruh kodlari, "bugungi dars"ni belgilash, testni ochish/yopish, proyektor uchun **taqdimot rejimi** (← → , F — to'liq ekran), natijalar jadvali va CSV (Excel) eksport.
- 🧒 **O'quvchi** — guruh kodi bilan ro'yxatdan o'tadi (email shart emas), bugungi darsni ko'radi, ochiq testni topshiradi, o'z natijalarini kuzatadi.

Kurs rejasi Notion'dagi "IT kids 6 oylik ish reja" sahifasidan olingan (Excel va Scratch darslari — tegishli batafsil sahifalar asosida).

Oylar: 1 — Kompyuter savodxonligi, 2 — Video va AI, 3 — Scratch bloklari va mashqlar, 4 — Scratch o'yinlari (Snake, ayiqli Google Dino, Balloon shooter, Mole strike), 5 — HTML/CSS, 6 — Web va yakuniy loyihalar.

## Tez boshlash (demo rejim)

```bash
npm install
npm run dev
```

http://localhost:3000 ni oching. Supabase sozlanmagan bo'lsa, platforma **demo rejimda** ishlaydi — ma'lumotlar brauzerda saqlanadi:

| Rol | Login | Parol |
|---|---|---|
| O'qituvchi | `ustoz` | `123456` |
| O'quvchi | `ali` / `malika` | `123456` |

Demo guruh kodi: `DEMO01`, demo o'qituvchi kodi: `ustoz`.

## Haqiqiy ishga tushirish (Supabase + Vercel)

Demo rejimda har bir kompyuter o'z ma'lumotini saqlaydi. Sinfdagi barcha o'quvchilar natijasi o'qituvchiga ko'rinishi uchun Supabase (bepul) kerak:

1. [supabase.com](https://supabase.com) da loyiha yarating.
2. **SQL Editor** ga `supabase/migrations/0001_init.sql` faylini nusxalab, ishga tushiring (jadval va RLS xavfsizlik qoidalari).
3. `.env.example` dan `.env.local` yarating va to'ldiring (Supabase → Project Settings → API):
   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable kalit (`sb_publishable_...`)
   - `SUPABASE_SECRET_KEY` — secret kalit (`sb_secret_...`). Faqat serverda ishlatiladi — hech qachon `NEXT_PUBLIC_` qo'shmang!
   - `TEACHER_INVITE_CODE` — o'qituvchilar ro'yxatdan o'tadigan maxfiy kod (o'zingiz o'ylab topasiz)

   Eski nomlar (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) ham ishlaydi. `SUPABASE_JWKS_URL` kerak emas.
4. [Vercel](https://vercel.com) ga repozitoriyni ulang, shu 4 ta o'zgaruvchini **Environment Variables** ga kiriting va deploy qiling.

## O'qituvchi uchun qo'llanma

1. `TEACHER_INVITE_CODE` bilan o'qituvchi sifatida ro'yxatdan o'ting.
2. **O'qituvchi paneli → + Guruh** — guruh yarating va 6 belgili guruh kodini o'quvchilarga bering.
3. Darsda: dars sahifasi → **📍 Bugungi dars qilish** → **🖥️ Taqdimot rejimi**.
4. Dars oxirida **🔓 Testni ochish** — o'quvchilar kompyuter yoki telefondan topshiradi.
5. Guruh sahifasi → **📊 Natijalar** — rangli jadval va CSV yuklab olish.

## Kontentni tahrirlash

Darslar `content/month-1.ts` … `content/month-6.ts` fayllarida. Har dars:

```ts
{
  title, kind: "lesson" | "project" | "event",
  goals: [...], slides: [{ emoji, title, points, code?, tip? }],
  practice: [...], homework, rubric?, visual?, visualPreset?,
  quiz: [{ q, options, correct, explain?, code? }],
}
```

`**qalin**` va `` `kod` `` belgilari ishlaydi. Test variantlari build paytida avtomatik (barqaror) aralashtiriladi, shuning uchun `correct` ni istalgan joyga qo'yish mumkin.

## Buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Ishlab chiqish serveri |
| `npm run build` / `npm start` | Production build |
| `npm run lint` / `npm run typecheck` | Tekshiruvlar |
| `npm test` | Unit testlar (kontent validatsiyasi, baholash, Excel formulalari) |
| `npm run test:e2e` | Playwright smoke testlar (avval `npm run build`) |

Texnologiyalar: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Supabase, Vitest, Playwright.
