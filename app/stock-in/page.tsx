import { supabase } from "@/lib/supabase";
import StockInForm from "./StockInForm";

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

      <h1 className="text-3xl font-bold mb-6">
        Stock In
      </h1>

      <StockInForm
        items={items ?? []}
        projects={projects ?? []}
      />

    </div>
  );
}