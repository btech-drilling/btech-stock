import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    id,
    item_code,
    item_name,
    category,
    unit,
    minimum_stock,
  } = body;

  const { error } = await supabase
    .from("items")
    .update({
      item_code,
      item_name,
      category,
      unit,
      minimum_stock,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}