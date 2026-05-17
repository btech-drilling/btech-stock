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
    <div className="bg-white rounded shadow p-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="item_id"
          value={form.item_id}
          onChange={handleChange}
          className="w-full border rounded p-2"
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
          className="w-full border rounded p-2"
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
          className="w-full border rounded p-2"
          required
        />

        <input
          name="remark"
          placeholder="หมายเหตุ เช่น รับของจากร้าน / คืนจากไซต์ / PO No."
          value={form.remark}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded"
          >
            Save Stock In
          </button>

          <Link href="/" className="border px-5 py-2 rounded">
            Cancel
          </Link>
        </div>
      </form>

      {message && (
        <p className="mt-4 font-semibold text-green-600">
          {message}
        </p>
      )}
    </div>
  );
}