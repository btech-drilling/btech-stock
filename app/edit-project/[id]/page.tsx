"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    project_code: "",
    project_name: "",
    client_name: "",
    location_text: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadProject();
  }, []);

  async function loadProject() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setMessage("โหลดข้อมูลไม่สำเร็จ: " + error.message);
      setLoading(false);
      return;
    }

    setForm({
      project_code: data.project_code ?? "",
      project_name: data.project_name ?? "",
      client_name: data.client_name ?? "",
      location_text: data.location_text ?? "",
      status: data.status ?? "ACTIVE",
    });

    setLoading(false);
  }

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

    setMessage("กำลังบันทึก...");

    const res = await fetch("/api/projects/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        project_code: form.project_code,
        project_name: form.project_name,
        client_name: form.client_name,
        location_text: form.location_text,
        status: form.status,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      setMessage("เกิดข้อผิดพลาด: " + result.error);
      return;
    }

    setMessage("แก้ไข Project สำเร็จ");

    setTimeout(() => {
      router.push("/projects");
    }, 800);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-orange-600">
          PROJECT MANAGEMENT
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          Edit Project
        </h1>

        <p className="mt-1 text-slate-500">
          Update project information
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="project_code"
            placeholder="Project Code"
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
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Save Changes
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