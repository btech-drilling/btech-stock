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
      setMessage(`ปรับยอดสำเร็จ ส่วนต่าง = ${result.difference}`);
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
              {item.item_code} - {item.item_name} | ในระบบ {item.current_stock} {item.unit}
            </option>
          ))}
        </select>

        <input
          name="actual_stock"
          type="number"
          placeholder="จำนวนที่นับจริง"
          value={form.actual_stock}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />

        <input
          name="remark"
          placeholder="หมายเหตุ เช่น ตรวจนับ stock เริ่มต้น / พบของขาด / พบของเกิน"
          value={form.remark}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded"
          >
            Save Adjustment
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