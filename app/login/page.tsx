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
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-orange-600">
            BTECH STOCK SYSTEM
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-900">
            Login
          </h1>

          <p className="mt-2 text-slate-500">
            Inventory Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Username
            </label>

            <input
              type="email"
              placeholder="admin@btech.local"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="w-full rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Login
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