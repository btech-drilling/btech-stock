export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

export default async function ProjectUsagePage() {
  const { data, error } = await supabase
    .from("stock_movements")
    .select(`
      id,
      movement_type,
      quantity,
      created_at,
      project:projects(project_code, project_name),
      item:items(item_code, item_name, item_type, unit, unit_cost)
    `)
    .not("project_id", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const rows = data ?? [];

  const summary = rows.reduce((acc: any, m: any) => {
    const projectCode = m.project?.project_code ?? "-";
    const projectName = m.project?.project_name ?? "No Project";
    const key = projectCode;

    if (!acc[key]) {
      acc[key] = {
        projectCode,
        projectName,
        outQty: 0,
        returnQty: 0,
        scrapQty: 0,
        netQty: 0,
        assetQty: 0,
        consumableQty: 0,
        movementCount: 0,
        totalCost: 0,
        items: {},
      };
    }

    const itemCode = m.item?.item_code;
    const itemType = m.item?.item_type;
    const unitCost = Number(m.item?.unit_cost ?? 0);
    const qty = Math.abs(Number(m.quantity ?? 0));
    const type = m.movement_type;

    acc[key].movementCount += 1;

    if (!itemCode) return acc;

    if (!acc[key].items[itemCode]) {
      acc[key].items[itemCode] = {
        itemType,
        unitCost,
        outQty: 0,
        returnQty: 0,
        scrapQty: 0,
        netQty: 0,
        totalCost: 0,
      };
    }

    const item = acc[key].items[itemCode];

    if (type === "OUT") {
      acc[key].outQty += qty;
      acc[key].netQty += qty;

      item.outQty += qty;
      item.netQty += qty;

      if (itemType === "ASSET") acc[key].assetQty += qty;
      if (itemType === "CONSUMABLE") acc[key].consumableQty += qty;
    }

    if (type === "RETURN") {
      acc[key].returnQty += qty;
      acc[key].netQty -= qty;

      item.returnQty += qty;
      item.netQty -= qty;
    }

    if (type === "SCRAP") {
      acc[key].scrapQty += qty;
      item.scrapQty += qty;

      if (itemType === "CONSUMABLE") {
        acc[key].netQty += qty;
        item.netQty += qty;
      }
    }

    if (itemType === "ASSET") {
      item.totalCost = item.scrapQty * unitCost;
    } else {
      item.totalCost = item.netQty * unitCost;
    }

    acc[key].totalCost = Object.values(acc[key].items).reduce(
      (sum: number, i: any) => sum + i.totalCost,
      0
    );

    return acc;
  }, {});

  const summaryList = Object.values(summary);

  const totalProjects = summaryList.length;

  const totalOut = summaryList.reduce(
    (sum: number, p: any) => sum + p.outQty,
    0
  );

  const totalReturn = summaryList.reduce(
    (sum: number, p: any) => sum + p.returnQty,
    0
  );

  const totalCost = summaryList.reduce(
    (sum: number, p: any) => sum + p.totalCost,
    0
  );

  const topCostProjects = [...summaryList]
    .sort((a: any, b: any) => b.totalCost - a.totalCost)
    .slice(0, 5);

  const maxProjectCost = Math.max(
    ...topCostProjects.map((p: any) => p.totalCost),
    1
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Project Summary
        </h1>
        <p className="text-slate-500">
          Summary of stock usage and cost by project
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Projects</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {totalProjects}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Stock Out</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">
            {totalOut}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Returned</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {totalReturn}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Total Cost</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            ฿{totalCost.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-800">
            Top Project Cost
          </h2>
          <p className="text-sm text-slate-500">
            Top 5 projects by calculated cost
          </p>
        </div>

        <div className="space-y-4">
          {topCostProjects.map((p: any) => (
            <div key={p.projectCode}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">
                  {p.projectCode}
                </span>

                <span className="font-bold text-blue-600">
                  ฿{p.totalCost.toLocaleString()}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${(p.totalCost / maxProjectCost) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}

          {topCostProjects.length === 0 && (
            <div className="text-sm text-slate-400">
              No cost data
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-100 text-sm text-slate-600">
            <tr>
              <th className="px-4 py-3">Project Code</th>
              <th className="px-4 py-3">Project Name</th>
              <th className="px-4 py-3 text-right">Stock Out</th>
              <th className="px-4 py-3 text-right">Return</th>
              <th className="px-4 py-3 text-right">Scrap</th>
              <th className="px-4 py-3 text-right">Net Usage</th>
              <th className="px-4 py-3 text-right">Asset</th>
              <th className="px-4 py-3 text-right">Consumable</th>
              <th className="px-4 py-3 text-right">Cost (฿)</th>
              <th className="px-4 py-3 text-right">Movements</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {summaryList.map((p: any) => (
              <tr key={p.projectCode} className="border-t text-sm">
                <td className="px-4 py-3 font-semibold text-slate-700">
                  {p.projectCode}
                </td>

                <td className="px-4 py-3 text-slate-700">
                  {p.projectName}
                </td>

                <td className="px-4 py-3 text-right">{p.outQty}</td>

                <td className="px-4 py-3 text-right text-green-600">
                  {p.returnQty}
                </td>

                <td className="px-4 py-3 text-right text-red-600">
                  {p.scrapQty}
                </td>

                <td className="px-4 py-3 text-right font-bold text-orange-600">
                  {p.netQty}
                </td>

                <td className="px-4 py-3 text-right">{p.assetQty}</td>

                <td className="px-4 py-3 text-right">
                  {p.consumableQty}
                </td>

                <td className="px-4 py-3 text-right font-bold text-blue-600">
                  ฿{p.totalCost.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-right">
                  {p.movementCount}
                </td>

                <td className="px-4 py-3 text-center">
                  <a
                    href={`/project-usage/${p.projectCode}`}
                    className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    View Details
                  </a>
                </td>
              </tr>
            ))}

            {summaryList.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No project usage data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}