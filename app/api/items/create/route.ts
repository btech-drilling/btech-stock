import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    item_code,
    item_name,
    item_type,
    category,
    unit,
    minimum_stock,
  } = body;

  const validTypes = ["CONSUMABLE", "TOOL", "ASSET"];

  const finalItemType = validTypes.includes(item_type)
    ? item_type
    : "CONSUMABLE";

  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        item_code,
        item_name,
        item_type: finalItemType,
        category,
        unit,
        minimum_stock,
      },
    ])
    .select();

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
    data,
  });
}