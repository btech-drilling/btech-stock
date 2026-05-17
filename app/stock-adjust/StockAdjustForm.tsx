"use client";

import { useState } from "react";
import Link from "next/link";

export default function StockAdjustForm({
  items,
}: {
  items: any[];
}) {
  const [form, setForm] = useState({
    item_id: "",
    actual_stock: "",
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

    const res = await fetch("/api/stock-adjust", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_id: Number(form.item_id),
        actual_stock: Number(form.actual_stock),
        remark: form.remark,
      }),
    });

    const result = await res.json();

    if (result.success) {
      setMessage(
        `ปรับยอดสำเร็จ ส่วนต่าง = ${result.difference}`
      );

      setForm({
        item_id: "",
        actual_stock: "",
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
          Stock Adjustment
        </h2>

        <p className="mt-1 text-slate-500">
          Adjust stock quantity after physical counting
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
              {item.item_code} - {item.item_name} |
              ระบบ = {item.current_stock} {item.unit}
            </option>
          ))}
        </select>

        <input
          name="actual_stock"
          type="number"
          placeholder="จำนวนที่นับจริง"
          value={form.actual_stock}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
          required
        />

        <input
          name="remark"
          placeholder="หมายเหตุ เช่น ตรวจนับ stock เริ่มต้น / พบของขาด / พบของเกิน"
          value={form.remark}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
        />

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Save Adjustment
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