import "server-only";
import type { Lesson, Month, PublicQuestion, Question, WeekDraft } from "./types";
import { months } from "./months";
import { toMeta, type WeekMeta } from "@/lib/catalog";
import { month1 } from "./month-1";
import { month2 } from "./month-2";
import { month3 } from "./month-3";
import { month4 } from "./month-4";
import { month5 } from "./month-5";
import { month6 } from "./month-6";

export { months };

const monthWeeks: WeekDraft[][] = [month1, month2, month3, month4, month5, month6];

export interface WeekInfo {
  month: number;
  week: number;
  title: string;
  lessons: Lesson[];
}

/** Satr asosidagi barqaror tasodifiy son generatori (har build'da bir xil natija). */
function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

/** Javob variantlarini aralashtiradi — to'g'ri javob doim bir joyda turmasligi uchun. */
export function shuffleQuestion(q: Question, seed: string): Question {
  const rnd = seededRandom(seed);
  const order = q.options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), correct: order.indexOf(q.correct) };
}

export const weeks: WeekInfo[] = [];
export const lessons: Lesson[] = [];

monthWeeks.forEach((mw, mi) => {
  mw.forEach((w, wi) => {
    const weekNum = mi * 4 + wi + 1;
    const info: WeekInfo = { month: mi + 1, week: weekNum, title: w.title, lessons: [] };
    w.days.forEach((d, di) => {
      const id = `m${mi + 1}-w${weekNum}-d${di + 1}`;
      const lesson: Lesson = {
        ...d,
        quiz: d.quiz.map((q, qi) => shuffleQuestion(q, `${id}#${qi}`)),
        id,
        num: lessons.length + 1,
        month: mi + 1,
        week: weekNum,
        day: di + 1,
      };
      lessons.push(lesson);
      info.lessons.push(lesson);
    });
    weeks.push(info);
  });
});

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getMonth(num: number): Month | undefined {
  return months.find((m) => m.num === num);
}

export function weeksOfMonth(num: number): WeekInfo[] {
  return weeks.filter((w) => w.month === num);
}

export function publicQuiz(lesson: Lesson): PublicQuestion[] {
  return lesson.quiz.map(({ q, options, code }) => ({ q, options, code }));
}

export function neighbours(id: string): { prev?: Lesson; next?: Lesson } {
  const i = lessons.findIndex((l) => l.id === id);
  return { prev: lessons[i - 1], next: lessons[i + 1] };
}

export function catalogWeeks(): WeekMeta[] {
  return weeks.map((w) => ({ month: w.month, week: w.week, title: w.title, lessons: w.lessons.map(toMeta) }));
}
