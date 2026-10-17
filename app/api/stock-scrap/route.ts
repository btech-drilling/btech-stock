import {allMovementRows,projectPositions, SITE_SCRAP, WAREHOUSE_SCRAP, positionNeedsReview} from '@/lib/project-stock';
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "stock scrap route is working",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { item_id, project_id, quantity, remark, source = 'warehouse' } = body;
    if (!['site','warehouse'].includes(source) || !item_id || !Number.isFinite(Number(quantity)) || Number(quantity)<=0 || (source==='site'&&!project_id)) return NextResponse.json({success:false,error:'กรุณาระบุตำแหน่งและจำนวนให้ถูกต้อง'},{status:400});
    if(source==='site'){
      const {data:history,error}=await allMovementRows(supabase.from('stock_movements').select('item_id,project_id,movement_type,quantity,remark').eq('item_id',item_id).eq('project_id',project_id));
      if(error)return NextResponse.json({success:false,error:error.message},{status:500});
      const position=projectPositions(history??[])[0];
      if(!position||positionNeedsReview(position)||Number(quantity)>position.balance)return NextResponse.json({success:false,error:'ยอดชำรุดเกินของที่ไซต์ หรือมีประวัติเดิมต้องตรวจสอบ กรุณาดูหน้าคลัง / ของที่ไซต์'},{status:400});
      const {error:insertError}=await supabase.from('stock_movements').insert({item_id,project_id,movement_type:'SCRAP',quantity:Number(quantity),remark:SITE_SCRAP+' '+String(remark??'').replace(/\[BTECH_[^\]]*\]/g,'')});
      return NextResponse.json(insertError?{success:false,error:insertError.message}:{success:true},{status:insertError?500:200});
    }

    if (!item_id || !quantity || quantity <= 0) {
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

    const currentStock = Number(item.current_stock ?? 0);

    if (currentStock < Number(quantity)) {
      return NextResponse.json({
        success: false,
        error: "จำนวน Scrap มากกว่า Stock คงเหลือ",
      });
    }

    const newStock = currentStock - Number(quantity);

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
        project_id: null,
        movement_type: "SCRAP",
        quantity,
        remark: WAREHOUSE_SCRAP+" "+String(remark??"").replace(/\[BTECH_[^\]]*\]/g,""),
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