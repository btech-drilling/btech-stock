import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {

  const body = await req.json();

  const {
    item_code,
    item_name,
    category,
    unit,
    minimum_stock,
  } = body;

  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        item_code,
        item_name,
        category,
        unit,
        minimum_stock,
      },
    ]);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data,
  });
}