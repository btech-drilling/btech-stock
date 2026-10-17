import {allMovementRows,projectPositions,isReturnable,positionNeedsReview} from '@/lib/project-stock';
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

    if(status==='CLOSED'){
  const {data:history,error:historyError}=await allMovementRows(supabase.from('stock_movements').select('item_id,project_id,movement_type,quantity,remark,items(item_type)').eq('project_id',id));
  if(historyError)return NextResponse.json({success:false,error:historyError.message},{status:500});
  const types=new Map((history??[]).map((m:any)=>[String(m.item_id),m.items?.item_type]));
  const pending=projectPositions(history??[]).filter(r=>!types.get(r.itemId)||isReturnable(String(types.get(r.itemId))));
  if(pending.some(r=>r.balance>0||positionNeedsReview(r)))return NextResponse.json({success:false,error:'ยังมีอุปกรณ์รอคืนหรือรายการต้องตรวจสอบ กรุณาดูสรุปโครงการและเคลียร์ยอดก่อนปิด'},{status:409});
    }

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