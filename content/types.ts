export type VisualKey =
  | "computer-parts"
  | "file-explorer"
  | "paint"
  | "excel"
  | "video-timeline"
  | "prompt-builder"
  | "typing"
  | "scratch"
  | "game"
  | "code";

export interface Slide {
  title: string;
  emoji?: string;
  points: string[];
  /** Kod yoki formula namunasi (monospace bilan ko'rsatiladi) */
  code?: string;
  /** O'qituvchi uchun yoki qiziqarli fakt */
  tip?: string;
}

export interface Question {
  q: string;
  options: string[];
  /** To'g'ri javob indeksi (0 dan boshlanadi) */
  correct: number;
  explain?: string;
  code?: string;
}

/** Klientga yuboriladigan savol (to'g'ri javobsiz) */
export type PublicQuestion = Omit<Question, "correct" | "explain">;

export type LessonKind = "lesson" | "project" | "event";

export interface Lesson {
  /** Masalan: "m1-w1-d1" */
  id: string;
  /** 1..72 — kurs bo'yicha tartib raqami */
  num: number;
  month: number;
  week: number;
  day: number;
  title: string;
  kind: LessonKind;
  goals: string[];
  slides: Slide[];
  /** Sinf ishi — qadamma-qadam amaliy topshiriq */
  practice: string[];
  homework: string;
  visual?: VisualKey;
  /** Visual komponentga beriladigan boshlang'ich qiymat (masalan, kod namunasi) */
  visualPreset?: string;
  /** Loyiha darslari uchun baholash mezonlari */
  rubric?: string[];
  quiz: Question[];
}

export interface Month {
  num: number;
  title: string;
  emoji: string;
  /** Tailwind rang nomi: masalan "sky" */
  color: string;
  summary: string;
}

/** Oy fayllarida yozish uchun qulay shakl: id/num/month/week/day avtomatik qo'yiladi */
export type LessonDraft = Omit<Lesson, "id" | "num" | "month" | "week" | "day">;

export interface WeekDraft {
  title: string;
  days: [LessonDraft, LessonDraft, LessonDraft];
}
