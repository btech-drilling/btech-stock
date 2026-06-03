"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AddItemPage() {
  const [form, setForm] = useState({
    item_code: "",
    item_name: "",
    item_type: "CONSUMABLE",
    category: "",
    unit: "",
    minimum_stock: "",
    unit_cost: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage() {
    if (!imageFile) return "";

    const fileExt = imageFile.name.split(".").pop();
    const safeCode = form.item_code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-");

    const fileName = `${safeCode}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("item-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("item-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const imageUrl = await uploadImage();

      const res = await fetch("/api/items/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          minimum_stock: Number(form.minimum_stock || 0),
          unit_cost: Number(form.unit_cost || 0),
          image_url: imageUrl,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setMessage("เพิ่ม Item สำเร็จ");

        setForm({
          item_code: "",
          item_name: "",
          item_type: "CONSUMABLE",
          category: "",
          unit: "",
          minimum_stock: "",
          unit_cost: "",
        });

        setImageFile(null);
        setImagePreview("");
      } else {
        setMessage("เกิดข้อผิดพลาด: " + result.error);
      }
    } catch (error: any) {
      setMessage("เกิดข้อผิดพลาด: " + error.message);
    } finally {
      setSaving(false);
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
              Item Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
            />

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Item preview"
                  className="h-32 w-32 rounded-xl border border-slate-200 object-cover"
                />
              </div>
            )}
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Item Type
            </label>

            <select
              name="item_type"
              value={form.item_type}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              required
            >
              <option value="CONSUMABLE">
                CONSUMABLE - วัสดุสิ้นเปลือง
              </option>

              <option value="TOOL">
                TOOL - เครื่องมือ / อุปกรณ์ใช้งานซ้ำ
              </option>

              <option value="ASSET">
                ASSET - ทรัพย์สิน / อุปกรณ์ถาวร
              </option>
            </select>
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

          <div className="grid grid-cols-2 gap-5">
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Unit Cost (฿)
              </label>

              <input
                name="unit_cost"
                type="number"
                value={form.unit_cost}
                onChange={handleChange}
                placeholder="ราคาทุนต่อหน่วย"
                className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="cursor-pointer rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving ? "Saving..." : "Save Item"}
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