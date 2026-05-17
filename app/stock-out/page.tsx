export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import StockOutForm from "./StockOutForm";

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
      <h1 className="text-3xl font-bold mb-6">Stock Out</h1>

      <StockOutForm
        items={items ?? []}
        projects={projects ?? []}
      />
    </div>
  );
}