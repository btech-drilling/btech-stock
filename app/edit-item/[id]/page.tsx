export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import EditItemForm from "./EditItemForm";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

  const { id } = await params;

  const { data: item, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <EditItemForm item={item} />;
}