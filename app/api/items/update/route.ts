import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    id,
    item_code,
    item_name,
    item_type,
    category,
    unit,
    minimum_stock,
    unit_cost,
  } = body;

  const validTypes = ["CONSUMABLE", "TOOL", "ASSET"];

  const finalItemType = validTypes.includes(item_type)
    ? item_type
    : "CONSUMABLE";

  const { error } = await supabase
    .from("items")
    .update({
      item_code,
      item_name,
      item_type: finalItemType,
      category,
      unit,
      minimum_stock: Number(minimum_stock ?? 0),
      unit_cost: Number(unit_cost ?? 0),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}