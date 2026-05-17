import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { item_id, actual_stock, remark } = body;

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("current_stock")
    .eq("id", item_id)
    .single();

  if (itemError) {
    return NextResponse.json(
      { success: false, error: itemError.message },
      { status: 500 }
    );
  }

  const currentStock = Number(item.current_stock ?? 0);
  const actualStock = Number(actual_stock);
  const difference = actualStock - currentStock;

  const { error: movementError } = await supabase
    .from("stock_movements")
    .insert([
      {
        item_id,
        project_id: null,
        movement_type: "ADJUST",
        quantity: difference,
        remark: remark || `ปรับยอดจาก ${currentStock} เป็น ${actualStock}`,
      },
    ]);

  if (movementError) {
    return NextResponse.json(
      { success: false, error: movementError.message },
      { status: 500 }
    );
  }

  const { error: updateError } = await supabase
    .from("items")
    .update({ current_stock: actualStock })
    .eq("id", item_id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    difference,
  });
}