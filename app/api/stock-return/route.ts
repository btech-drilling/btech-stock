import {allMovementRows,projectPositions} from '@/lib/project-stock';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "stock return route is working",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { item_id, project_id, quantity, remark } = body;

    if (!item_id || !project_id || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      return NextResponse.json({
        success: false,
        error: "ข้อมูลไม่ครบถ้วน",
      });
    }

    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("id, current_stock")
      .eq("id", item_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({
        success: false,
        error: itemError?.message || "ไม่พบ Item",
      });
    }

    const {data:history,error:historyError}=await allMovementRows(supabase.from('stock_movements').select('item_id,project_id,movement_type,quantity,remark').eq('item_id',item_id).eq('project_id',project_id));
    if(historyError)return NextResponse.json({success:false,error:historyError.message},{status:500});
    const position=projectPositions(history??[])[0];
    if(!position || position.invalid || Number(quantity)>position.balance)return NextResponse.json({success:false,error:'จำนวนคืนเกินยอดเบิกคงค้างของโครงการ กรุณาตรวจหน้าคลัง / ของที่ไซต์'},{status:400});
    const newStock = Number(item.current_stock) + Number(quantity);

    const { error: updateError } = await supabase
      .from("items")
      .update({
        current_stock: newStock,
      })
      .eq("id", item_id);

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message,
      });
    }

    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        item_id,
        project_id,
        movement_type: "RETURN",
        quantity,
        remark,
      });

    if (movementError) {
      return NextResponse.json({
        success: false,
        error: movementError.message,
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