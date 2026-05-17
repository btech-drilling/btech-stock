"use client";

import { useState } from "react";
import Link from "next/link";

export default function StockInForm({
  items,
  projects,
}: {
  items: any[];
  projects: any[];
}) {
  const [form, setForm] = useState({
    item_id: "",
    project_id: "",
    quantity: "",
    remark: "",
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

    const res = await fetch("/api/stock-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: Number(form.item_id),
        project_id: form.project_id ? Number(form.project_id) : null,
        quantity: Number(form.quantity),
        remark: form.remark,
      }),
    });

    const result = await res.json();

    if (result.success) {
      setMessage("รับของเข้า Stock สำเร็จ");
      setForm({
        item_id: "",
        project_id: "",
        quantity: "",
        remark: "",
      });
    } else {
      setMessage("เกิดข้อผิดพลาด: " + result.error);
    }
  }

  return (
    <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Receive Stock
        </h2>

        <p className="mt-1 text-slate-500">
          Add stock into central warehouse or project inventory
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <select
          name="item_id"
          value={form.item_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          required
        >
          <option value="">-- เลือก Item --</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.item_code} - {item.item_name}
            </option>
          ))}
        </select>

        <select
          name="project_id"
          value={form.project_id}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
        >
          <option value="">-- ไม่ระบุ Project / เข้าคลังกลาง --</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.project_code} - {project.project_name}
            </option>
          ))}
        </select>

        <input
          name="quantity"
          type="number"
          placeholder="จำนวนรับเข้า"
          value={form.quantity}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          required
        />

        <input
          name="remark"
          placeholder="หมายเหตุ เช่น รับของจากร้าน / คืนจากไซต์ / PO No."
          value={form.remark}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
        />

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Save Stock In
          </button>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>

      {message && (
        <div className="mt-6 rounded-xl bg-green-100 px-4 py-3 font-semibold text-green-700">
          {message}
        </div>
      )}
    </div>
  );
}