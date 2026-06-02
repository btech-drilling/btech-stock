import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = Number(body.projectId);

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Invalid project id" },
        { status: 400 }
      );
    }

    const { count, error: countError } = await supabase
      .from("stock_movements")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);

    if (countError) {
      return NextResponse.json(
        { success: false, error: countError.message },
        { status: 500 }
      );
    }

    if ((count ?? 0) > 0) {
      const { error: updateError } = await supabase
        .from("stock_movements")
        .update({ project_id: null })
        .eq("project_id", projectId);

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      moved_movements_to_central: count ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}