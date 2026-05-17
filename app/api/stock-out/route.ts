import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    item_id,
    project_id,
    quantity,
    remark,
  } = body;

  // หา stock ปัจจุบัน
  const { data: item, error: itemError } =
    await supabase
      .from("items")
      .select("current_stock")
      .eq("id", item_id)
      .single();

  if (itemError) {
    return NextResponse.json(
      {
        success: false,
        error: itemError.message,
      },
      { status: 500 }
    );
  }

  const currentStock = Number(
    item.current_stock ?? 0
  );

  // เช็ค stock พอไหม
  if (quantity > currentStock) {
    return NextResponse.json(
      {
        success: false,
        error: "Stock ไม่เพียงพอ",
      },
      { status: 400 }
    );
  }

  // บันทึก movement
  const { error: movementError } =
    await supabase
      .from("stock_movements")
      .insert([
        {
          item_id,
          project_id,
          movement_type: "OUT",
          quantity: -Math.abs(quantity),
          remark,
        },
      ]);

  if (movementError) {
    return NextResponse.json(
      {
        success: false,
        error: movementError.message,
      },
      { status: 500 }
    );
  }

  // ลด stock
  const newStock =
    currentStock - Number(quantity);

  const { error: updateError } =
    await supabase
      .from("items")
      .update({
        current_stock: newStock,
      })
      .eq("id", item_id);

  if (updateError) {
    return NextResponse.json(
      {
        success: false,
        error: updateError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}