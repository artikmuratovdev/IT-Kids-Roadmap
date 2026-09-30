import type { Question } from "@/content/types";

export interface GradeResult {
  score: number;
  total: number;
  percent: number;
  /** Har bir savol uchun: to'g'ri javob indeksi, o'quvchi javobi va izoh */
  review: { correct: number; given: number | null; ok: boolean; explain?: string }[];
}

export function grade(quiz: Question[], answers: (number | null)[]): GradeResult {
  const review = quiz.map((q, i) => {
    const given = typeof answers[i] === "number" ? (answers[i] as number) : null;
    return { correct: q.correct, given, ok: given === q.correct, explain: q.explain };
  });
  const score = review.filter((r) => r.ok).length;
  const total = quiz.length;
  return { score, total, percent: total ? Math.round((score / total) * 100) : 0, review };
}

export function gradeLabel(percent: number): { text: string; emoji: string; tone: "great" | "good" | "try" } {
  if (percent >= 85) return { text: "A'lo!", emoji: "🏆", tone: "great" };
  if (percent >= 60) return { text: "Yaxshi!", emoji: "👍", tone: "good" };
  return { text: "Yana urinib ko'ring", emoji: "💪", tone: "try" };
}
