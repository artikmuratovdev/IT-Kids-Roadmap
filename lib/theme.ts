/** Tailwind dinamik klasslarni ko'rmaydi, shuning uchun har oy uchun tayyor klasslar. */
export interface Theme {
  bg: string;
  soft: string;
  text: string;
  border: string;
  ring: string;
  grad: string;
}

export const themes: Record<number, Theme> = {
  1: { bg: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", ring: "ring-sky-300", grad: "from-sky-400 to-cyan-500" },
  2: { bg: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", ring: "ring-violet-300", grad: "from-violet-400 to-fuchsia-500" },
  3: { bg: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", ring: "ring-amber-300", grad: "from-amber-400 to-orange-500" },
  4: { bg: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", ring: "ring-rose-300", grad: "from-rose-400 to-pink-500" },
  5: { bg: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", ring: "ring-emerald-300", grad: "from-emerald-400 to-teal-500" },
  6: { bg: "bg-indigo-500", soft: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", ring: "ring-indigo-300", grad: "from-indigo-400 to-blue-500" },
};

export const theme = (month: number): Theme => themes[month] ?? themes[1];
