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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/projects/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-600 hover:underline">
          ← Back to Projects
        </Link>

        <h1 className="text-3xl font-bold mt-2">Add Project</h1>
      </div>

      <div className="bg-white rounded shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="project_code"
            placeholder="Project Code เช่น SCG-2026-CHAOM"
            value={form.project_code}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <input
            name="project_name"
            placeholder="Project Name"
            value={form.project_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <input
            name="client_name"
            placeholder="Client Name"
            value={form.client_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="location_text"
            placeholder="Location"
            value={form.location_text}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
            <option value="HOLD">HOLD</option>
          </select>

          <div className="flex gap-3">
            <button className="bg-black text-white px-5 py-2 rounded">
              Save Project
            </button>

            <Link href="/projects" className="border px-5 py-2 rounded">
              Cancel
            </Link>
          </div>
        </form>

        {message && (
          <p className="mt-4 font-semibold text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}