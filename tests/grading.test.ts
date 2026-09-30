import { describe, expect, it } from "vitest";
import { grade, gradeLabel } from "@/lib/grading";

const quiz = [
  { q: "1", options: ["a", "b"], correct: 0 },
  { q: "2", options: ["a", "b"], correct: 1 },
  { q: "3", options: ["a", "b", "c"], correct: 2, explain: "izoh" },
];

describe("grade", () => {
  it("to'g'ri javoblarni sanaydi", () => {
    const r = grade(quiz, [0, 1, 0]);
    expect(r.score).toBe(2);
    expect(r.total).toBe(3);
    expect(r.percent).toBe(67);
    expect(r.review[2]).toEqual({ correct: 2, given: 0, ok: false, explain: "izoh" });
  });

  it("javobsiz savollar noto'g'ri hisoblanadi", () => {
    const r = grade(quiz, [null, undefined as unknown as null]);
    expect(r.score).toBe(0);
    expect(r.review[0].given).toBeNull();
    expect(r.review[2].given).toBeNull();
  });

  it("baho yorlig'i", () => {
    expect(gradeLabel(100).tone).toBe("great");
    expect(gradeLabel(70).tone).toBe("good");
    expect(gradeLabel(30).tone).toBe("try");
  });
});
