import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

  const res = await fetch(
    "https://api.line.me/v2/bot/info",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}