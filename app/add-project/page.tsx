"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddProjectPage() {
  const [form, setForm] = useState({
    project_code: "",
    project_name: "",
    client_name: "",
    location_text: "",
    status: "ACTIVE",
  });

  const [message, setMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();

    if (result.success) {
      setMessage("เพิ่ม Project สำเร็จ");
      setForm({
        project_code: "",
        project_name: "",
        client_name: "",
        location_text: "",
        status: "ACTIVE",
      });
    } else {
      setMessage("เกิดข้อผิดพลาด: " + result.error);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-orange-600">
          PROJECT MANAGEMENT
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          Add Project
        </h1>

        <p className="mt-1 text-slate-500">
          Create a new drilling or exploration project
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="project_code"
            placeholder="Project Code เช่น SCG-2026-CHAOM"
            value={form.project_code}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            required
          />

          <input
            name="project_name"
            placeholder="Project Name"
            value={form.project_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            required
          />

          <input
            name="client_name"
            placeholder="Client Name"
            value={form.client_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          />

          <input
            name="location_text"
            placeholder="Location"
            value={form.location_text}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="HOLD">HOLD</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <div className="flex gap-4 pt-2">
            <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
              Save Project
            </button>

            <Link
              href="/projects"
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </Link>
          </div>
        </form>

        {message && (
          <div className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-green-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}