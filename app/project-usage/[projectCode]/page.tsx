export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectCode: string }>;
}) {
  const { projectCode } = await params;

  const { data, error } = await supabase
    .from("stock_movements")
    .select(`
      movement_type,
      quantity,
      item:items(
        item_code,
        item_name,
        item_type,
        unit,
        unit_cost
      ),
      project:projects(
        project_code
      )
    `);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const filtered = (data ?? []).filter(
    (r: any) => r.project?.project_code === projectCode
  );

  const summary = filtered.reduce((acc: any, row: any) => {
    const itemCode = row.item?.item_code;

    if (!itemCode) return acc;

    if (!acc[itemCode]) {
      acc[itemCode] = {
        itemCode,
        itemName: row.item.item_name,
        itemType: row.item.item_type,
        unit: row.item.unit,
        unitCost: Number(row.item.unit_cost ?? 0),
        outQty: 0,
        returnQty: 0,
        scrapQty: 0,
        netQty: 0,
        totalCost: 0,
      };
    }

    const qty = Math.abs(Number(row.quantity ?? 0));

    if (row.movement_type === "OUT") {
      acc[itemCode].outQty += qty;
      acc[itemCode].netQty += qty;
    }

    if (row.movement_type === "RETURN") {
      acc[itemCode].returnQty += qty;
      acc[itemCode].netQty -= qty;
    }

    if (row.movement_type === "SCRAP") {
      acc[itemCode].scrapQty += qty;

      if (row.item.item_type === "CONSUMABLE") {
        acc[itemCode].netQty += qty;
      }
    }

    if (row.item.item_type === "ASSET") {
      acc[itemCode].totalCost =
        acc[itemCode].scrapQty * acc[itemCode].unitCost;
    } else {
      acc[itemCode].totalCost =
        acc[itemCode].netQty * acc[itemCode].unitCost;
    }

    return acc;
  }, {});

  const items = Object.values(summary);

  const projectTotalCost = items.reduce(
    (sum: number, item: any) => sum + item.totalCost,
    0
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{projectCode}</h1>
          <p className="text-slate-500">Project Item Usage Detail</p>
        </div>

        <Link
          href="/project-usage"
          className="rounded bg-slate-700 px-4 py-2 text-white"
        >
          Back
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Item Code</th>
              <th className="px-4 py-3 text-left">Item Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Unit</th>
              <th className="px-4 py-3 text-right">Out</th>
              <th className="px-4 py-3 text-right">Return</th>
              <th className="px-4 py-3 text-right">Scrap</th>
              <th className="px-4 py-3 text-right">Net</th>
              <th className="px-4 py-3 text-right">Unit Cost (฿)</th>
              <th className="px-4 py-3 text-right">Cost (฿)</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item: any) => (
              <tr key={item.itemCode} className="border-t">
                <td className="px-4 py-3">{item.itemCode}</td>
                <td className="px-4 py-3">{item.itemName}</td>

                <td className="px-4 py-3">
                  <span
                    className={
                      item.itemType === "ASSET"
                        ? "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                        : "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                    }
                  >
                    {item.itemType}
                  </span>
                </td>

                <td className="px-4 py-3">{item.unit}</td>

                <td className="px-4 py-3 text-right">{item.outQty}</td>

                <td className="px-4 py-3 text-right text-green-600">
                  {item.returnQty}
                </td>

                <td className="px-4 py-3 text-right text-red-600">
                  {item.scrapQty}
                </td>

                <td className="px-4 py-3 text-right font-bold text-orange-600">
                  {item.netQty}
                </td>

                <td className="px-4 py-3 text-right">
                  ฿{item.unitCost.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-right font-bold text-blue-600">
                  ฿{item.totalCost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow">
        <div className="text-sm text-slate-500">Total Project Cost</div>

        <div className="mt-2 text-3xl font-bold text-green-600">
          ฿{projectTotalCost.toLocaleString()}
        </div>

        <div className="mt-2 text-sm text-slate-500">
          Consumable cost is calculated from net usage. Asset cost is calculated from scrap only.
        </div>
      </div>
    </div>
  );
}