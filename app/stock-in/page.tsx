export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import StockInForm from "@/app/stock-in/StockInForm";

export default async function StockInPage() {
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
          Stock In
        </h1>

        <p className="mt-1 text-slate-500">
          Receive drilling equipment or consumables into inventory
        </p>
      </div>

      <StockInForm
        items={items ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}