"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Login ไม่สำเร็จ: " + error.message);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="stock-login flex min-h-screen items-center justify-center p-6">
      <div className="stock-logincard w-full max-w-md bg-white p-10">
        <div className="mb-8 text-center"><div className="stock-loginmark">B</div>
          <p className="text-sm font-semibold text-teal-700">
            STOCK & EQUIPMENT
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            เข้าสู่ระบบ
          </h1>

          <p className="mt-2 text-slate-500">
            ระบบคลังสินค้าและอุปกรณ์ BTECH
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              อีเมล
            </label>

            <input
              autoComplete="username"
              type="email"
              placeholder="admin@btech.local"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-teal-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              รหัสผ่าน
            </label>

            <input
              autoComplete="current-password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-teal-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full rounded-xl bg-teal-600 px-6 py-3 font-semibold text-white hover:bg-teal-700"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {message && (
          <div className="mt-6 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}