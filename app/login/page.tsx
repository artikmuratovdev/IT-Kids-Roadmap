"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { store, useAuth } from "@/lib/data";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const u = await store.signIn(username, password);
      setUser(u);
      router.push(u.role === "teacher" ? "/oqituvchi" : "/darslar");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <h1 className="text-2xl font-black">👋 Kirish</h1>
        <label className="block">
          <span className="text-sm font-bold">Login</span>
          <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label className="block">
          <span className="text-sm font-bold">Parol</span>
          <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error && <p className="rounded-lg bg-rose-50 p-2 text-sm font-semibold text-rose-700">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Kirilmoqda..." : "Kirish"}</button>
        <p className="text-center text-sm">
          Akkaunt yo&apos;qmi? <Link href="/register" className="font-bold text-indigo-600">Ro&apos;yxatdan o&apos;ting</Link>
        </p>
      </form>
      {store.mode === "demo" && (
        <div className="card mt-4 bg-amber-50 p-4 text-sm">
          <p className="font-black text-amber-800">🧪 Demo rejim (ma&apos;lumotlar faqat shu brauzerda saqlanadi)</p>
          <ul className="mt-2 space-y-1 text-amber-900">
            <li>O&apos;qituvchi: <b>ustoz</b> / <b>123456</b></li>
            <li>O&apos;quvchi: <b>ali</b> / <b>123456</b> yoki <b>malika</b> / <b>123456</b></li>
            <li>Guruh kodi: <b>DEMO01</b>, o&apos;qituvchi kodi: <b>ustoz</b></li>
          </ul>
        </div>
      )}
    </div>
  );
}
