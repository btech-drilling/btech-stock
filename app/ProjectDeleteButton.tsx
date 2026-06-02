"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectDeleteButton({
  id,
  projectCode,
}: {
  id: number;
  projectCode: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const firstConfirm = window.confirm(
      `ต้องการลบ Project "${projectCode}" ใช่หรือไม่?`
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      `ยืนยันอีกครั้ง\n\nถ้า Project นี้มี Movement อยู่ ระบบจะย้าย Movement เหล่านั้นไปเป็น "คลังกลาง" ก่อนลบ Project\n\nต้องการลบจริงหรือไม่?`
    );

    if (!secondConfirm) return;

    setLoading(true);

    try {
      const response = await fetch("/api/projects/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projectId: id }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert(result.error ?? "Delete project failed");
        return;
      }

      alert(
        `ลบ Project สำเร็จ\nMovement ที่ย้ายไปคลังกลาง: ${result.moved_movements_to_central} รายการ`
      );

      router.refresh();
    } catch (error: any) {
      alert(error.message ?? "Delete project failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}