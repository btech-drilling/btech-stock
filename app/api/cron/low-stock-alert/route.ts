import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function sendLineMessage(message: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TO_ID;

  if (!token || !to) {
    return {
      success: false,
      error: "Missing LINE_CHANNEL_ACCESS_TOKEN or LINE_TO_ID",
    };
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
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
          text: message,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();

    return {
      success: false,
      error: errorText,
    };
  }

  return {
    success: true,
  };
}

function buildLowStockMessage(items: any[]) {
  const lines = items.map((item, index) => {
    const currentStock = Number(item.current_stock ?? 0);
    const minimumStock = Number(item.minimum_stock ?? 0);
    const shortage = Math.max(minimumStock - currentStock, 0);

    return `${index + 1}. [${item.item_type ?? "CONSUMABLE"}] ${
      item.item_code
    } - ${item.item_name}
คงเหลือ: ${currentStock} ${item.unit}
ขั้นต่ำ: ${minimumStock} ${item.unit}
ควรสั่งเพิ่มอย่างน้อย: ${shortage} ${item.unit}`;
  });

  return `🚨 BTECH Stock Alert

รายการที่ถึงหรือต่ำกว่า Minimum Stock

${lines.join("\n\n")}

กรุณาตรวจสอบและสั่งซื้อเพิ่มเติม`;
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: allItems, error } = await supabase
    .from("items")
    .select(
      "id, item_code, item_name, item_type, unit, current_stock, minimum_stock"
    );

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  const lowItems =
    allItems?.filter(
      (item) =>
        Number(item.current_stock ?? 0) <= Number(item.minimum_stock ?? 0)
    ) ?? [];

  const alertsToSend = [];

  for (const item of lowItems) {
    const { data: existingLog, error: logError } = await supabase
      .from("stock_alert_logs")
      .select("id")
      .eq("item_id", item.id)
      .eq("alert_date", today)
      .maybeSingle();

    if (logError) {
      return NextResponse.json(
        {
          success: false,
          error: logError.message,
        },
        { status: 500 }
      );
    }

    if (!existingLog) {
      alertsToSend.push(item);
    }
  }

  if (alertsToSend.length === 0) {
    return NextResponse.json({
      success: true,
      date: today,
      message: "No new alerts today",
      total_low_stock: lowItems.length,
      alerts_to_send: [],
    });
  }

  const lineMessage = buildLowStockMessage(alertsToSend);
  const lineResult = await sendLineMessage(lineMessage);

  if (!lineResult.success) {
    return NextResponse.json(
      {
        success: false,
        date: today,
        error: lineResult.error,
        alerts_to_send: alertsToSend,
      },
      { status: 500 }
    );
  }

  for (const item of alertsToSend) {
    const { error: insertError } = await supabase
      .from("stock_alert_logs")
      .insert({
        item_id: item.id,
        alert_date: today,
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        sent_to: "LINE",
      });

    if (insertError) {
      return NextResponse.json(
        {
          success: false,
          error: insertError.message,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    success: true,
    date: today,
    line_sent: true,
    total_low_stock: lowItems.length,
    alerts_sent: alertsToSend.length,
    alerts_to_send: alertsToSend,
  });
}