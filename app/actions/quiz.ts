"use server";

import { getLesson } from "@/content";
import { grade, type GradeResult } from "@/lib/grading";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { adminClient, serverClient } from "@/lib/supabase/server";

function checkAnswers(answers: unknown): (number | null)[] {
  if (!Array.isArray(answers)) throw new Error("Javoblar noto'g'ri formatda");
  return answers.map((a) => (typeof a === "number" && Number.isInteger(a) ? a : null));
}

/** Faqat baholaydi (demo rejim uchun). To'g'ri javoblar faqat topshirilgandan keyin qaytadi. */
export async function gradeQuiz(lessonId: string, answers: (number | null)[]): Promise<GradeResult> {
  // Supabase rejimida javoblarni faqat submitQuiz orqali (tekshiruv bilan) olish mumkin
  if (isSupabaseConfigured) throw new Error("Demo rejim o'chirilgan");
  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error("Dars topilmadi");
  return grade(lesson.quiz, checkAnswers(answers));
}

/** Supabase rejimi: o'quvchini tekshiradi, test ochiqligini tekshiradi, baholaydi va saqlaydi. */
export async function submitQuiz(lessonId: string, answers: (number | null)[]): Promise<GradeResult> {
  if (!isSupabaseConfigured) throw new Error("Supabase sozlanmagan");
  const lesson = getLesson(lessonId);
  if (!lesson) throw new Error("Dars topilmadi");

  const supabase = await serverClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Avval tizimga kiring");

  const admin = adminClient();
  const { data: profile } = await admin.from("profiles").select("id, role, group_id").eq("id", auth.user.id).single();
  if (!profile) throw new Error("Profil topilmadi");

  if (profile.role === "student") {
    if (!profile.group_id) throw new Error("Siz hali guruhga qo'shilmagansiz");
    const { data: gl } = await admin
      .from("group_lessons")
      .select("test_open")
      .eq("group_id", profile.group_id)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (!gl?.test_open) throw new Error("Bu test hozir yopiq. O'qituvchi ochishini kuting.");
  }

  const clean = checkAnswers(answers);
  const result = grade(lesson.quiz, clean);

  // O'qituvchi o'z testini sinab ko'rsa — saqlanmaydi
  if (profile.role === "student") {
    const { error } = await admin.from("quiz_attempts").insert({
      student_id: profile.id,
      group_id: profile.group_id,
      lesson_id: lessonId,
      answers: clean,
      score: result.score,
      total: result.total,
    });
    if (error) throw new Error("Natijani saqlab bo'lmadi: " + error.message);
  }
  return result;
}
