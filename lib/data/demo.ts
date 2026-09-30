"use client";

import { gradeQuiz } from "@/app/actions/quiz";
import type { Attempt, DataStore, Group, GroupLesson, Profile, SignUpInput } from "./types";
import { validUsername } from "./types";

/**
 * Demo rejim: hamma narsa brauzerning localStorage'ida saqlanadi.
 * Supabase sozlanmaganda platformani sinab ko'rish uchun.
 */

interface DemoDb {
  users: (Profile & { password: string })[];
  groups: Group[];
  groupLessons: GroupLesson[];
  attempts: Attempt[];
  session: string | null;
}

const KEY = "itkids-demo-v1";
export const DEMO_TEACHER_CODE = "ustoz";

function seed(): DemoDb {
  return {
    users: [
      { id: "t1", username: "ustoz", full_name: "Demo O'qituvchi", role: "teacher", group_id: null, password: "123456" },
      { id: "s1", username: "ali", full_name: "Ali Valiyev", role: "student", group_id: "g1", password: "123456" },
      { id: "s2", username: "malika", full_name: "Malika Karimova", role: "student", group_id: "g1", password: "123456" },
    ],
    groups: [{ id: "g1", name: "Demo guruh", join_code: "DEMO01", teacher_id: "t1" }],
    groupLessons: [{ group_id: "g1", lesson_id: "m1-w1-d1", is_current: true, test_open: true }],
    attempts: [],
    session: null,
  };
}

function load(): DemoDb {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DemoDb;
  } catch {
    /* localStorage mavjud emas */
  }
  const db = seed();
  save(db);
  return db;
}

function save(db: DemoDb) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* e'tiborsiz */
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function strip(u: Profile & { password?: string }): Profile {
  return { id: u.id, username: u.username, full_name: u.full_name, role: u.role, group_id: u.group_id };
}

export function randomJoinCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function upsertGroupLesson(db: DemoDb, groupId: string, lessonId: string): GroupLesson {
  let gl = db.groupLessons.find((g) => g.group_id === groupId && g.lesson_id === lessonId);
  if (!gl) {
    gl = { group_id: groupId, lesson_id: lessonId, is_current: false, test_open: false };
    db.groupLessons.push(gl);
  }
  return gl;
}

export const demoStore: DataStore = {
  mode: "demo",
  async me() {
    const db = load();
    const u = db.users.find((x) => x.id === db.session);
    return u ? strip(u) : null;
  },
  async signIn(username, password) {
    const db = load();
    const u = db.users.find((x) => x.username === username.trim().toLowerCase());
    if (!u || u.password !== password) throw new Error("Login yoki parol noto'g'ri");
    db.session = u.id;
    save(db);
    return strip(u);
  },
  async signUp(input: SignUpInput) {
    const db = load();
    const username = input.username.trim().toLowerCase();
    if (!validUsername(username)) throw new Error("Login 3-24 ta lotin harfi, raqam, _ yoki . bo'lsin");
    if (input.password.length < 6) throw new Error("Parol kamida 6 ta belgi bo'lsin");
    if (!input.full_name.trim()) throw new Error("Ism-familiyani kiriting");
    if (db.users.some((u) => u.username === username)) throw new Error("Bu login band. Boshqasini tanlang.");
    let group_id: string | null = null;
    if (input.role === "teacher") {
      if (input.code.trim() !== DEMO_TEACHER_CODE) throw new Error(`O'qituvchi kodi noto'g'ri (demo: ${DEMO_TEACHER_CODE})`);
    } else {
      const g = db.groups.find((x) => x.join_code === input.code.trim().toUpperCase());
      if (!g) throw new Error("Guruh kodi topilmadi. O'qituvchidan so'rang.");
      group_id = g.id;
    }
    const user = { id: uid(), username, full_name: input.full_name.trim(), role: input.role, group_id, password: input.password };
    db.users.push(user);
    db.session = user.id;
    save(db);
    return strip(user);
  },
  async signOut() {
    const db = load();
    db.session = null;
    save(db);
  },
  async myGroup() {
    const db = load();
    const u = db.users.find((x) => x.id === db.session);
    return db.groups.find((g) => g.id === u?.group_id) ?? null;
  },
  async teacherGroups() {
    const db = load();
    return db.groups.filter((g) => g.teacher_id === db.session);
  },
  async createGroup(name) {
    const db = load();
    if (!db.session) throw new Error("Avval tizimga kiring");
    const g: Group = { id: uid(), name: name.trim(), join_code: randomJoinCode(), teacher_id: db.session };
    db.groups.push(g);
    save(db);
    return g;
  },
  async groupStudents(groupId) {
    return load().users.filter((u) => u.group_id === groupId && u.role === "student").map(strip);
  },
  async groupLessons(groupId) {
    return load().groupLessons.filter((g) => g.group_id === groupId);
  },
  async setCurrentLesson(groupId, lessonId) {
    const db = load();
    db.groupLessons.filter((g) => g.group_id === groupId).forEach((g) => (g.is_current = false));
    upsertGroupLesson(db, groupId, lessonId).is_current = true;
    save(db);
  },
  async setTestOpen(groupId, lessonId, open) {
    const db = load();
    upsertGroupLesson(db, groupId, lessonId).test_open = open;
    save(db);
  },
  async myAttempts() {
    const db = load();
    return db.attempts.filter((a) => a.student_id === db.session);
  },
  async groupAttempts(groupId) {
    return load().attempts.filter((a) => a.group_id === groupId);
  },
  async submitAttempt(lessonId, answers) {
    const db = load();
    const u = db.users.find((x) => x.id === db.session);
    if (!u) throw new Error("Avval tizimga kiring");
    if (u.role === "student") {
      const gl = db.groupLessons.find((g) => g.group_id === u.group_id && g.lesson_id === lessonId);
      if (!gl?.test_open) throw new Error("Bu test hozir yopiq. O'qituvchi ochishini kuting.");
    }
    const result = await gradeQuiz(lessonId, answers);
    if (u.role === "student") {
      const fresh = load();
      fresh.attempts.push({
        id: uid(),
        student_id: u.id,
        group_id: u.group_id,
        lesson_id: lessonId,
        answers,
        score: result.score,
        total: result.total,
        created_at: new Date().toISOString(),
      });
      save(fresh);
    }
    return result;
  },
};
