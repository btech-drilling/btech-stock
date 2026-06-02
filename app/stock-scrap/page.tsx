export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import StockScrapForm from "./StockScrapForm";

export default async function StockScrapPage() {
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
          Stock Scrap
        </h1>

        <p className="mt-1 text-slate-500">
          Record damaged, lost, or discarded stock
        </p>
      </div>

      <StockScrapForm items={items ?? []} projects={projects ?? []} />
    </div>
  );
}