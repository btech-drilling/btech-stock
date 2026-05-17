export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import StockOutForm from "@/app/stock-out/StockOutForm";

export default async function StockOutPage() {
  const { data: items } = await supabase
    .from("items")
    .select("*")
    .order("item_name");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("project_code");

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-orange-600">
          STOCK MOVEMENT
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          Stock Out
        </h1>

        <p className="mt-1 text-slate-500">
          Issue drilling equipment or consumables to project
        </p>
      </div>

      <StockOutForm
        items={items ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}