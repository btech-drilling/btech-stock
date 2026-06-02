import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "projects update route is working",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      project_code,
      project_name,
      client_name,
      location_text,
      status,
    } = body;

    const { error } = await supabase
      .from("projects")
      .update({
        project_code,
        project_name,
        client_name,
        location_text,
        status,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}