"use client";

import { useState } from "react";
import Link from "next/link";

export default function AddItemPage() {
  const [form, setForm] = useState({
    item_code: "",
    item_name: "",
    category: "",
    unit: "",
    minimum_stock: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/items/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        minimum_stock: Number(form.minimum_stock),
      }),
    });

    const result = await res.json();

    if (result.success) {
      setMessage("เพิ่ม Item สำเร็จ");

      setForm({
        item_code: "",
        item_name: "",
        category: "",
        unit: "",
        minimum_stock: "",
      });
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
          Add Item
        </h1>

        <p className="mt-1 text-slate-500">
          Create a new drilling inventory item
        </p>
      </div>

      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Item Code
            </label>

            <input
              name="item_code"
              value={form.item_code}
              onChange={handleChange}
              placeholder="เช่น ROD-NQ-3M"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Item Name
            </label>

            <input
              name="item_name"
              value={form.item_name}
              onChange={handleChange}
              placeholder="ชื่ออุปกรณ์"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
              </label>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Rod / Bit / Mud"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Unit
              </label>

              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="pcs / rods / bags"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Minimum Stock
            </label>

            <input
              name="minimum_stock"
              type="number"
              value={form.minimum_stock}
              onChange={handleChange}
              placeholder="จำนวนขั้นต่ำ"
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="cursor-pointer rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Save Item
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
          <div className="mt-6 rounded-xl bg-green-100 px-4 py-3 text-green-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}