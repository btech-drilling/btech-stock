export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

export default async function ProjectUsagePage() {
  const { data: movements, error } = await supabase
    .from("stock_movements")
    .select(`
      id,
      movement_type,
      quantity,
      remark,
      created_at,
      items (
        item_code,
        item_name,
        unit
      ),
      projects (
        project_code,
        project_name
      )
    `)
    .not("project_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Project Usage Report
      </h1>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Date</th>
              <th className="p-3">Project</th>
              <th className="p-3">Item</th>
              <th className="p-3">Type</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Remark</th>
            </tr>
          </thead>

          <tbody>
            {movements?.map((m: any) => (
              <tr key={m.id} className="border-t">
                <td className="p-3">
                  {new Date(m.created_at).toLocaleString("th-TH")}
                </td>

                <td className="p-3">
                  {m.projects?.project_code} - {m.projects?.project_name}
                </td>

                <td className="p-3">
                  {m.items?.item_code} - {m.items?.item_name}
                </td>

                <td className="p-3 font-semibold">
                  {m.movement_type}
                </td>

                <td className="p-3 font-bold">
                  {m.quantity} {m.items?.unit}
                </td>

                <td className="p-3">
                  {m.remark}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}