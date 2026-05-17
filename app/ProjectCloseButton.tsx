"use client";

export default function ProjectCloseButton({
  id,
}: {
  id: number;
}) {
  async function handleClose() {
    const ok = confirm("ต้องการปิด Project นี้ใช่ไหม?");
    if (!ok) return;

    const res = await fetch("/api/projects/close", {
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
      alert("ปิด Project ไม่สำเร็จ: " + result.error);
    }
  }

  return (
    <button
      onClick={handleClose}
      className="text-orange-600 hover:underline"
    >
      Close
    </button>
  );
}