"use client";

export default function DeleteButton({ id }: { id: number }) {
  async function handleDelete() {
    const ok = confirm("ต้องการลบรายการนี้ใช่ไหม?");
    if (!ok) return;

    const res = await fetch("/api/items/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();

    if (result.success) {
      window.location.reload();
    } else {
      alert("ลบไม่สำเร็จ: " + result.error);
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="cursor-pointer font-semibold text-red-600 hover:text-red-800 hover:underline"
    >
      Delete
    </button>
  );
}