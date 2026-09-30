"use client";

import { useCallback, useEffect, useState } from "react";
import { store, useAuth } from "./index";
import type { Attempt, Group, GroupLesson } from "./types";

/** O'quvchining guruhi, guruhdagi dars holatlari va o'z urinishlari. */
export function useStudentState() {
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupLessons, setGroupLessons] = useState<GroupLesson[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    if (!user || user.role !== "student") {
      setLoaded(true);
      return;
    }
    const g = await store.myGroup();
    setGroup(g);
    setGroupLessons(g ? await store.groupLessons(g.id) : []);
    setAttempts(await store.myAttempts());
    setLoaded(true);
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  const best = (lessonId: string) => {
    const mine = attempts.filter((a) => a.lesson_id === lessonId);
    if (!mine.length) return null;
    return mine.reduce((b, a) => (a.score / a.total > b.score / b.total ? a : b));
  };
  const status = (lessonId: string) => groupLessons.find((g) => g.lesson_id === lessonId);
  const current = groupLessons.find((g) => g.is_current)?.lesson_id ?? null;

  return { group, groupLessons, attempts, loaded, reload, best, status, current };
}

const GROUP_KEY = "itkids-selected-group";

/** O'qituvchining guruhlari va tanlangan guruhdagi dars holatlari. */
export function useTeacherState() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupIdState] = useState<string | null>(null);
  const [groupLessons, setGroupLessons] = useState<GroupLesson[]>([]);

  const setGroupId = useCallback((id: string) => {
    setGroupIdState(id);
    try {
      localStorage.setItem(GROUP_KEY, id);
    } catch {
      /* e'tiborsiz */
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "teacher") return;
    store.teacherGroups().then((gs) => {
      setGroups(gs);
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(GROUP_KEY);
      } catch {
        /* e'tiborsiz */
      }
      const pick = gs.find((g) => g.id === saved)?.id ?? gs[0]?.id ?? null;
      setGroupIdState(pick);
    });
  }, [user]);

  const reload = useCallback(async () => {
    if (groupId) setGroupLessons(await store.groupLessons(groupId));
  }, [groupId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const status = (lessonId: string) => groupLessons.find((g) => g.lesson_id === lessonId);

  async function makeCurrent(lessonId: string) {
    if (!groupId) return;
    await store.setCurrentLesson(groupId, lessonId);
    await reload();
  }
  async function toggleTest(lessonId: string) {
    if (!groupId) return;
    await store.setTestOpen(groupId, lessonId, !status(lessonId)?.test_open);
    await reload();
  }

  return { groups, setGroups, groupId, setGroupId, groupLessons, status, makeCurrent, toggleTest, reload };
}
