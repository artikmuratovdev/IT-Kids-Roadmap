"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { adminClient } from "@/lib/supabase/server";
import { usernameToEmail, validUsername, type SignUpInput } from "@/lib/data/types";

/**
 * Ro'yxatdan o'tkazish serverda bajariladi: guruh kodi / o'qituvchi kodi tekshiriladi,
 * foydalanuvchi email tasdiqlashsiz yaratiladi (bolalarda email bo'lmasligi mumkin).
 */
export async function signUpAction(input: SignUpInput): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: "Supabase sozlanmagan" };
  const username = input.username.trim().toLowerCase();
  if (!validUsername(username)) return { ok: false, error: "Login 3-24 ta lotin harfi, raqam, _ yoki . bo'lsin" };
  if (input.password.length < 6) return { ok: false, error: "Parol kamida 6 ta belgi bo'lsin" };
  if (!input.full_name.trim()) return { ok: false, error: "Ism-familiyani kiriting" };

  const admin = adminClient();
  let groupId: string | null = null;

  if (input.role === "teacher") {
    if (!process.env.TEACHER_INVITE_CODE || input.code.trim() !== process.env.TEACHER_INVITE_CODE)
      return { ok: false, error: "O'qituvchi kodi noto'g'ri" };
  } else {
    const { data: group } = await admin.from("groups").select("id").eq("join_code", input.code.trim().toUpperCase()).maybeSingle();
    if (!group) return { ok: false, error: "Guruh kodi topilmadi. O'qituvchidan so'rang." };
    groupId = group.id;
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password: input.password,
    email_confirm: true,
  });
  if (error || !created.user) {
    const taken = error?.message.toLowerCase().includes("already");
    return { ok: false, error: taken ? "Bu login band. Boshqasini tanlang." : error?.message ?? "Xatolik" };
  }

  const { error: pErr } = await admin.from("profiles").insert({
    id: created.user.id,
    username,
    full_name: input.full_name.trim(),
    role: input.role,
    group_id: groupId,
  });
  if (pErr) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "Profil yaratilmadi: " + pErr.message };
  }
  return { ok: true };
}
