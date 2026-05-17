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
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mt-2">Edit Item</h1>
      </div>

      <div className="bg-white rounded shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="item_code"
            value={form.item_code}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <input
            name="item_name"
            value={form.item_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="minimum_stock"
            type="number"
            value={form.minimum_stock}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-black text-white px-5 py-2 rounded"
            >
              Save Change
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
    </div>
  );
}