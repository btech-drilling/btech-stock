import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    project_code,
    project_name,
    client_name,
    location_text,
    status,
  } = body;

  const { error } = await supabase
    .from("projects")
    .insert([
      {
        project_code,
        project_name,
        client_name,
        location_text,
        status: status || "ACTIVE",
      },
    ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}