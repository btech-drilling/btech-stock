export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

export default async function MovementsPage() {
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
    .order("created_at", { ascending: false });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold text-orange-600">
          STOCK AUDIT TRAIL
        </p>

        <h1 className="text-4xl font-bold text-slate-900">
          Movement History
        </h1>

        <p className="mt-1 text-slate-500">
          Complete inventory transaction history
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Stock Movements
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Item</th>
              <th className="p-4">Project</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Remark</th>
            </tr>
          </thead>

          <tbody>
            {movements?.map((m: any) => (
              <tr key={m.id} className="border-t border-slate-100">
                <td className="p-4 text-slate-600">
                  {new Date(m.created_at).toLocaleString("th-TH")}
                </td>

                <td className="p-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {m.movement_type}
                  </span>
                </td>

                <td className="p-4">
                  <div className="font-semibold text-slate-800">
                     {m.items?.item_code}
                  </div>

              <div className="text-sm text-slate-500">
                 {m.items?.item_name}
              </div>
              </td>

                <td className="p-4 text-slate-600">
                  {m.projects
                    ? `${m.projects.project_code} - ${m.projects.project_name}`
                    : "คลังกลาง"}
                </td>

                <td
                  className={
                    Number(m.quantity) < 0
                      ? "p-4 font-bold text-red-600"
                      : "p-4 font-bold text-green-700"
                  }
                >
                  {m.quantity} {m.items?.unit}
                </td>

                <td className="p-4 text-slate-600">
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