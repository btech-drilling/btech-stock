"use client";

import { useState } from "react";
import Link from "next/link";

export default function EditItemForm({ item }: { item: any }) {
  const [form, setForm] = useState({
    item_code: item.item_code ?? "",
    item_name: item.item_name ?? "",
    category: item.category ?? "",
    unit: item.unit ?? "",
    minimum_stock: item.minimum_stock ?? "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/items/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
        ...form,
        minimum_stock: Number(form.minimum_stock),
      }),
    });

    const result = await res.json();

    if (result.success) {
      setMessage("แก้ไขข้อมูลสำเร็จ");
    } else {
      setMessage("เกิดข้อผิดพลาด: " + result.error);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-orange-600">
          INVENTORY MANAGEMENT
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          Edit Item
        </h1>

        <p className="mt-1 text-slate-500">
          Update item master data. Stock quantity should be adjusted via Stock Adjust.
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="item_code"
            value={form.item_code}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            required
          />

          <input
            name="item_name"
            value={form.item_name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            required
          />

          <div className="grid grid-cols-2 gap-5">
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            />

            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            />
          </div>

          <input
            name="minimum_stock"
            type="number"
            value={form.minimum_stock}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          />

          <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
            Current Stock is locked. Use <b>Stock Adjust</b> to correct stock quantity.
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Save Change
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
    </div>
  );
}