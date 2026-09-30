import { describe, expect, it } from "vitest";
import { catalogWeeks, getLesson, lessons, months, publicQuiz, shuffleQuestion, weeks } from "@/content";

describe("kurs kontenti", () => {
  it("6 oy, 24 hafta va 72 dars", () => {
    expect(months).toHaveLength(6);
    expect(weeks).toHaveLength(24);
    expect(lessons).toHaveLength(72);
  });

  it("dars id'lari unikal va tartib raqamlari 1..72", () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(72);
    expect(lessons.map((l) => l.num)).toEqual(Array.from({ length: 72 }, (_, i) => i + 1));
  });

  it.each(lessons.map((l) => [l.id, l] as const))("%s — to'liq material", (_, l) => {
    expect(l.title.trim()).not.toBe("");
    expect(l.goals.length).toBeGreaterThanOrEqual(2);
    expect(l.slides.length).toBeGreaterThanOrEqual(4);
    l.slides.forEach((s) => expect(s.points.length).toBeGreaterThan(0));
    expect(l.practice.length).toBeGreaterThanOrEqual(4);
    expect(l.homework.trim()).not.toBe("");
    expect(l.quiz.length).toBeGreaterThanOrEqual(5);
    l.quiz.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(Number.isInteger(q.correct)).toBe(true);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.options.length);
    });
    if (l.kind === "project") expect(l.rubric?.length ?? 0).toBeGreaterThanOrEqual(3);
  });

  it("aralashtirish to'g'ri javobni saqlaydi va deterministik", () => {
    const q = { q: "?", options: ["a", "b", "c", "d"], correct: 2 };
    const s1 = shuffleQuestion(q, "x");
    const s2 = shuffleQuestion(q, "x");
    expect(s1).toEqual(s2);
    expect(s1.options[s1.correct]).toBe("c");
    expect([...s1.options].sort()).toEqual(q.options);
  });

  it("to'g'ri javoblar bir joyga to'planib qolmagan", () => {
    const counts = [0, 0, 0, 0];
    lessons.forEach((l) => l.quiz.forEach((q) => counts[q.correct]++));
    const total = counts.reduce((a, b) => a + b, 0);
    counts.forEach((c) => expect(c / total).toBeLessThan(0.4));
  });

  it("ochiq test javobsiz yuboriladi", () => {
    const pq = publicQuiz(getLesson("m1-w1-d1")!);
    pq.forEach((q) => {
      expect(q).not.toHaveProperty("correct");
      expect(q).not.toHaveProperty("explain");
    });
  });

  it("katalog barcha darslarni o'z ichiga oladi", () => {
    expect(catalogWeeks().flatMap((w) => w.lessons)).toHaveLength(72);
  });
});
