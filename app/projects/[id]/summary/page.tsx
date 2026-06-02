export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ProjectSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number(id);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return <div>ไม่พบข้อมูลโครงการ</div>;
  }

  const { data: movements, error: movementError } = await supabase
    .from("stock_movements")
    .select(`
      id,
      movement_type,
      quantity,
      remark,
      created_at,
      items (
        id,
        item_code,
        item_name,
        item_type,
        unit
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (movementError) {
    return <div>Error: {movementError.message}</div>;
  }

  const summaryMap = new Map<string, any>();

  movements?.forEach((m: any) => {
    const item = m.items;
    if (!item) return;

    const key = String(item.id ?? `${item.item_code}-${item.item_type}-${item.unit}`);

    if (!summaryMap.has(key)) {
        summaryMap.set(key, {
        key,
        item_code: item.item_code,
        item_name: item.item_name,
        item_type: item.item_type,
        unit: item.unit,
        out: 0,
        returnQty: 0,
        scrap: 0,
        net_used: 0,
      });
    }

    const row = summaryMap.get(key);
    const qty = Math.abs(Number(m.quantity ?? 0));

    if (m.movement_type === "OUT") row.out += qty;
    if (m.movement_type === "RETURN") row.returnQty += qty;
    if (m.movement_type === "SCRAP") row.scrap += qty;

    row.net_used = row.out - row.returnQty - row.scrap;
  });

  const summary = Array.from(summaryMap.values()).sort((a, b) =>
    a.item_code.localeCompare(b.item_code)
  );

  const totalOut = summary.reduce((sum, row) => sum + row.out, 0);
  const totalReturn = summary.reduce((sum, row) => sum + row.returnQty, 0);
  const totalScrap = summary.reduce((sum, row) => sum + row.scrap, 0);
  const totalNet = summary.reduce((sum, row) => sum + row.net_used, 0);

  function itemTypeBadgeClass(value: string) {
    if (value === "TOOL") {
      return "rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700";
    }

    if (value === "ASSET") {
      return "rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700";
    }

    return "rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700";
  }

  function movementTypeBadgeClass(value: string) {
    if (value === "OUT") {
      return "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";
    }

    if (value === "RETURN") {
      return "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700";
    }

    if (value === "SCRAP") {
      return "rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700";
    }

    if (value === "ADJUST") {
      return "rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700";
    }

    return "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700";
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            PROJECT SUMMARY
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            {project.project_code}
          </h1>

          <p className="mt-1 text-slate-500">{project.project_name}</p>

          <p className="mt-1 text-sm text-slate-400">
            {project.client_name} / {project.location_text}
          </p>
        </div>

        <Link
          href="/projects"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Projects
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total OUT</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{totalOut}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total RETURN</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {totalReturn}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total SCRAP</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{totalScrap}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Net Used</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalNet}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Material / Asset Usage
          </h2>

          <span className="text-sm text-slate-500">
            {summary.length} item(s)
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Item Code</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Type</th>
              <th className="p-4 text-right">OUT</th>
              <th className="p-4 text-right">RETURN</th>
              <th className="p-4 text-right">SCRAP</th>
              <th className="p-4 text-right">NET USED</th>
              <th className="p-4">Unit</th>
            </tr>
          </thead>

          <tbody>
            {summary.length > 0 ? (
              summary.map((row) => (
                <tr key={row.key} className="border-t border-slate-100">
                  <td className="p-4 font-semibold text-slate-800">
                    {row.item_code}
                  </td>

                  <td className="p-4 text-slate-700">{row.item_name}</td>

                  <td className="p-4">
                    <span className={itemTypeBadgeClass(row.item_type)}>
                      {row.item_type}
                    </span>
                  </td>

                  <td className="p-4 text-right font-semibold text-red-600">
                    {row.out}
                  </td>

                  <td className="p-4 text-right font-semibold text-blue-600">
                    {row.returnQty}
                  </td>

                  <td className="p-4 text-right font-semibold text-red-700">
                    {row.scrap}
                  </td>

                  <td className="p-4 text-right font-bold text-slate-900">
                    {row.net_used}
                  </td>

                  <td className="p-4 text-slate-600">{row.unit}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  No movements found for this project
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">Movement Detail</h2>

          <span className="text-sm text-slate-500">
            {movements?.length ?? 0} movement(s)
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Item</th>
              <th className="p-4 text-right">Qty</th>
              <th className="p-4">Remark</th>
            </tr>
          </thead>

          <tbody>
            {movements && movements.length > 0 ? (
              movements.map((m: any) => {
                const isNegative =
                  m.movement_type === "OUT" || m.movement_type === "SCRAP";

                return (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="p-4 text-slate-600">
                      {new Date(m.created_at).toLocaleString("th-TH")}
                    </td>

                    <td className="p-4">
                      <span className={movementTypeBadgeClass(m.movement_type)}>
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

                    <td
                      className={
                        isNegative
                          ? "p-4 text-right font-bold text-red-600"
                          : "p-4 text-right font-bold text-green-700"
                      }
                    >
                      {isNegative ? "-" : "+"}
                      {Math.abs(Number(m.quantity))} {m.items?.unit}
                    </td>

                    <td className="p-4 text-slate-600">{m.remark}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  No movement detail
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}