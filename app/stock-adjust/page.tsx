export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import StockAdjustForm from "@/app/stock-adjust/StockAdjustForm";

export default async function StockAdjustPage() {
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .order("item_name");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Stock Adjustment</h1>

      <StockAdjustForm items={items ?? []} />
    </div>
  );
}