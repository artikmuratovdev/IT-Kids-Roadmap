"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { store, useAuth } from "@/lib/data";
import type { Role } from "@/lib/data/types";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [role, setRole] = useState<Role>("student");
  const [form, setForm] = useState({ full_name: "", username: "", password: "", code: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await store.signUp({ ...form, role });
      setUser(u);
      router.push(u.role === "teacher" ? "/oqituvchi" : "/darslar");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-black">✨ Ro&apos;yxatdan o&apos;tish</h1>
      <div className="grid grid-cols-2 gap-2">
        {(["student", "teacher"] as Role[]).map((r) => (
          <button
            type="button"
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-xl border-2 p-3 font-bold ${role === r ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200"}`}
          >
            {r === "student" ? "🧒 O'quvchi" : "🧑‍🏫 O'qituvchi"}
          </button>
        ))}
      </div>
      <label className="block">
        <span className="text-sm font-bold">Ism-familiya</span>
        <input className="input mt-1" value={form.full_name} onChange={set("full_name")} required />
      </label>
      <label className="block">
        <span className="text-sm font-bold">Login (lotin harflarda, masalan: ali2015)</span>
        <input className="input mt-1" value={form.username} onChange={set("username")} autoComplete="username" required />
      </label>
      <label className="block">
        <span className="text-sm font-bold">Parol (kamida 6 belgi)</span>
        <input className="input mt-1" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required />
      </label>
      <label className="block">
        <span className="text-sm font-bold">{role === "student" ? "Guruh kodi (o'qituvchidan oling)" : "O'qituvchi maxfiy kodi"}</span>
        <input className={`input mt-1 ${role === "student" ? "uppercase" : ""}`} value={form.code} onChange={set("code")} required />
      </label>
      {error && <p className="rounded-lg bg-rose-50 p-2 text-sm font-semibold text-rose-700">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}</button>
      <p className="text-center text-sm">
        Akkaunt bormi? <Link href="/login" className="font-bold text-indigo-600">Kirish</Link>
      </p>
    </form>
  );
}
