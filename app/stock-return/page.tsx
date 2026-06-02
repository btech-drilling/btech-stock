export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import StockReturnForm from "./StockReturnForm";

export default async function StockReturnPage() {
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
          Stock Return
        </h1>

        <p className="mt-1 text-slate-500">
          Return unused stock from project back to warehouse
        </p>
      </div>

      <StockReturnForm items={items ?? []} projects={projects ?? []} />
    </div>
  );
}