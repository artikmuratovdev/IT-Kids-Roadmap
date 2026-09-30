"use client";

import { signUpAction } from "@/app/actions/auth";
import { submitQuiz } from "@/app/actions/quiz";
import { browserClient } from "@/lib/supabase/client";
import { randomJoinCode } from "./demo";
import type { Attempt, DataStore, Group, GroupLesson, Profile } from "./types";
import { usernameToEmail } from "./types";

let client: ReturnType<typeof browserClient> | null = null;
const sb = () => (client ??= browserClient());

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

async function uidOrThrow(): Promise<string> {
  const { data } = await sb().auth.getUser();
  if (!data.user) throw new Error("Avval tizimga kiring");
  return data.user.id;
}

export const supabaseStore: DataStore = {
  mode: "supabase",
  async me() {
    const { data } = await sb().auth.getUser();
    if (!data.user) return null;
    const res = await sb().from("profiles").select("*").eq("id", data.user.id).maybeSingle();
    return (res.data as Profile | null) ?? null;
  },
  async signIn(username, password) {
    const { error } = await sb().auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (error) throw new Error("Login yoki parol noto'g'ri");
    const me = await supabaseStore.me();
    if (!me) throw new Error("Profil topilmadi");
    return me;
  },
  async signUp(input) {
    const res = await signUpAction(input);
    if (!res.ok) throw new Error(res.error);
    return supabaseStore.signIn(input.username, input.password);
  },
  async signOut() {
    await sb().auth.signOut();
  },
  async myGroup() {
    const me = await supabaseStore.me();
    if (!me?.group_id) return null;
    return must(await sb().from("groups").select("*").eq("id", me.group_id).maybeSingle()) as Group | null;
  },
  async teacherGroups() {
    const id = await uidOrThrow();
    return must(await sb().from("groups").select("*").eq("teacher_id", id).order("created_at")) as Group[];
  },
  async createGroup(name) {
    const id = await uidOrThrow();
    return must(
      await sb().from("groups").insert({ name: name.trim(), join_code: randomJoinCode(), teacher_id: id }).select().single(),
    ) as Group;
  },
  async groupStudents(groupId) {
    return must(
      await sb().from("profiles").select("*").eq("group_id", groupId).eq("role", "student").order("full_name"),
    ) as Profile[];
  },
  async groupLessons(groupId) {
    return must(await sb().from("group_lessons").select("*").eq("group_id", groupId)) as GroupLesson[];
  },
  async setCurrentLesson(groupId, lessonId) {
    must(await sb().from("group_lessons").update({ is_current: false }).eq("group_id", groupId));
    const existing = must(
      await sb().from("group_lessons").select("test_open").eq("group_id", groupId).eq("lesson_id", lessonId).maybeSingle(),
    ) as { test_open: boolean } | null;
    must(
      await sb()
        .from("group_lessons")
        .upsert({ group_id: groupId, lesson_id: lessonId, is_current: true, test_open: existing?.test_open ?? false }),
    );
  },
  async setTestOpen(groupId, lessonId, open) {
    const existing = must(
      await sb().from("group_lessons").select("is_current").eq("group_id", groupId).eq("lesson_id", lessonId).maybeSingle(),
    ) as { is_current: boolean } | null;
    must(
      await sb()
        .from("group_lessons")
        .upsert({ group_id: groupId, lesson_id: lessonId, test_open: open, is_current: existing?.is_current ?? false }),
    );
  },
  async myAttempts() {
    const id = await uidOrThrow();
    return must(await sb().from("quiz_attempts").select("*").eq("student_id", id).order("created_at")) as Attempt[];
  },
  async groupAttempts(groupId) {
    return must(await sb().from("quiz_attempts").select("*").eq("group_id", groupId).order("created_at")) as Attempt[];
  },
  async submitAttempt(lessonId, answers) {
    return submitQuiz(lessonId, answers);
  },
};
