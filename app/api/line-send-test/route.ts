import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TO_ID;

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
            text: "🚀 BTECH Stock System Test Message",
          },
        ],
      }),
    }
  );

  const text = await res.text();

  return NextResponse.json({
    status: res.status,
    response: text,
  });
}