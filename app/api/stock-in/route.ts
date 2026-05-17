import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { item_id, project_id, quantity, remark } = body;

  const { error: movementError } = await supabase
    .from("stock_movements")
    .insert([
      {
        item_id,
        project_id,
        movement_type: "IN",
        quantity,
        remark,
      },
    ]);

  if (movementError) {
    return NextResponse.json(
      { success: false, error: movementError.message },
      { status: 500 }
    );
  }

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

  const newStock = Number(item.current_stock ?? 0) + Number(quantity);

  const { error: updateError } = await supabase
    .from("items")
    .update({ current_stock: newStock })
    .eq("id", item_id);

  if (updateError) {
    return NextResponse.json(
      { success: false, error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}