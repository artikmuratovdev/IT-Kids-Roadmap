import type { Lesson, LessonKind, VisualKey } from "@/content/types";

/** Dars haqida ochiq ma'lumot — klient komponentlarga beriladi (test javoblarisiz). */
export interface LessonMeta {
  id: string;
  num: number;
  month: number;
  week: number;
  day: number;
  title: string;
  kind: LessonKind;
  quizCount: number;
  visual?: VisualKey;
}

export type PublicLesson = Omit<Lesson, "quiz"> & { quizCount: number };

export function toMeta(l: Lesson): LessonMeta {
  return { id: l.id, num: l.num, month: l.month, week: l.week, day: l.day, title: l.title, kind: l.kind, quizCount: l.quiz.length, visual: l.visual };
}

export function toPublic(l: Lesson): PublicLesson {
  const { quiz, ...rest } = l;
  return { ...rest, quizCount: quiz.length };
}

export interface WeekMeta {
  month: number;
  week: number;
  title: string;
  lessons: LessonMeta[];
}
