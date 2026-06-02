import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TO_ID;

  if (!token || !to) {
    return NextResponse.json({
      success: false,
      error: "Missing LINE env",
    });
  }

  const res = await fetch(
    "https://api.line.me/v2/bot/message/push",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to,
        messages: [
          {
            type: "text",
            text: "🚀 BTECH Stock Alert Test\n\nระบบส่ง LINE สำเร็จแล้ว",
          },
        ],
      }),
    }
  );

  const responseText = await res.text();

  return NextResponse.json({
    status: res.status,
    response: responseText,
  });
}