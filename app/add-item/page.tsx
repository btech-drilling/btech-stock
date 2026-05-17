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
    current_stock: "",
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

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    const res = await fetch(
      "/api/items/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          minimum_stock: Number(form.minimum_stock),
          current_stock: Number(form.current_stock),
        }),
      }
    );

    const result = await res.json();

    if (result.success) {

      setMessage("บันทึกข้อมูลสำเร็จ");

      setForm({
        item_code: "",
        item_name: "",
        category: "",
        unit: "",
        minimum_stock: "",
        current_stock: "",
      });

    } else {

      setMessage(
        "เกิดข้อผิดพลาด: " + result.error
      );

    }
  }

  return (
    <div>

      <div className="mb-6">

        <Link
          href="/"
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold mt-2">
          Add Item
        </h1>

      </div>

      <div className="bg-white rounded shadow p-6 max-w-2xl">

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            name="item_code"
            placeholder="Item Code"
            value={form.item_code}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <input
            name="item_name"
            placeholder="Item Name"
            value={form.item_name}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />

          <input
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="unit"
            placeholder="Unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="minimum_stock"
            type="number"
            placeholder="Minimum Stock"
            value={form.minimum_stock}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <input
            name="current_stock"
            type="number"
            placeholder="Current Stock"
            value={form.current_stock}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <div className="flex gap-3">

            <button
              type="submit"
              className="bg-black text-white px-5 py-2 rounded"
            >
              Save Item
            </button>

            <Link
              href="/"
              className="border px-5 py-2 rounded"
            >
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