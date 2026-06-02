export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ItemStockCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const itemId = Number(id);

  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return <div>ไม่พบข้อมูล Item</div>;
  }

  const { data: movements, error: movementError } = await supabase
    .from("stock_movements")
    .select(`
      id,
      movement_type,
      quantity,
      remark,
      created_at,
      projects (
        project_code,
        project_name
      )
    `)
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (movementError) {
    return <div>Error: {movementError.message}</div>;
  }

  const totalIn =
    movements
      ?.filter((m: any) => m.movement_type === "IN")
      .reduce((sum: number, m: any) => sum + Math.abs(Number(m.quantity)), 0) ??
    0;

  const totalOut =
    movements
      ?.filter((m: any) => m.movement_type === "OUT")
      .reduce((sum: number, m: any) => sum + Math.abs(Number(m.quantity)), 0) ??
    0;

  const totalReturn =
    movements
      ?.filter((m: any) => m.movement_type === "RETURN")
      .reduce((sum: number, m: any) => sum + Math.abs(Number(m.quantity)), 0) ??
    0;

  const totalScrap =
    movements
      ?.filter((m: any) => m.movement_type === "SCRAP")
      .reduce((sum: number, m: any) => sum + Math.abs(Number(m.quantity)), 0) ??
    0;

  const totalAdjust =
    movements
      ?.filter((m: any) => m.movement_type === "ADJUST")
      .reduce((sum: number, m: any) => sum + Number(m.quantity), 0) ?? 0;

  const netMovement =
    totalIn - totalOut + totalReturn - totalScrap + totalAdjust;

  const projectUsageMap = new Map<string, any>();

  movements?.forEach((m: any) => {
    if (!m.projects) return;

    const projectCode = m.projects.project_code;
    const key = projectCode;
    const qty = Math.abs(Number(m.quantity ?? 0));

    if (!projectUsageMap.has(key)) {
      projectUsageMap.set(key, {
        project_code: m.projects.project_code,
        project_name: m.projects.project_name,
        out: 0,
        returnQty: 0,
        scrap: 0,
        net_used: 0,
      });
    }

    const row = projectUsageMap.get(key);

    if (m.movement_type === "OUT") row.out += qty;
    if (m.movement_type === "RETURN") row.returnQty += qty;
    if (m.movement_type === "SCRAP") row.scrap += qty;

    row.net_used = row.out - row.returnQty - row.scrap;
  });

  const projectUsage = Array.from(projectUsageMap.values())
    .filter((row) => row.out > 0 || row.returnQty > 0 || row.scrap > 0)
    .sort((a, b) => b.net_used - a.net_used);

  function movementTypeBadgeClass(value: string) {
    if (value === "IN") {
      return "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700";
    }

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

  function itemTypeBadgeClass(value: string) {
    if (value === "TOOL") {
      return "rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700";
    }

    if (value === "ASSET") {
      return "rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700";
    }

    return "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700";
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">STOCK CARD</p>

          <h1 className="text-4xl font-bold text-slate-900">
            {item.item_code}
          </h1>

          <p className="mt-1 text-slate-500">{item.item_name}</p>

          <div className="mt-3 flex gap-2">
            <span className={itemTypeBadgeClass(item.item_type)}>
              {item.item_type}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Unit: {item.unit}
            </span>
          </div>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Back to Items
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Current Stock</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {item.current_stock}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Minimum Stock</p>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {item.minimum_stock}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Net Movement</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {netMovement}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Movement</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {movements?.length ?? 0}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">IN</p>
          <p className="mt-2 text-2xl font-bold text-green-700">{totalIn}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">OUT</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{totalOut}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">RETURN</p>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {totalReturn}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">SCRAP</p>
          <p className="mt-2 text-2xl font-bold text-red-700">{totalScrap}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">ADJUST</p>
          <p className="mt-2 text-2xl font-bold text-yellow-700">
            {totalAdjust}
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Project Usage Summary
          </h2>

          <span className="text-sm text-slate-500">
            {projectUsage.length} project(s)
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Project</th>
              <th className="p-4 text-right">OUT</th>
              <th className="p-4 text-right">RETURN</th>
              <th className="p-4 text-right">SCRAP</th>
              <th className="p-4 text-right">NET USED</th>
              <th className="p-4">Unit</th>
            </tr>
          </thead>

          <tbody>
            {projectUsage.length > 0 ? (
              projectUsage.map((row) => (
                <tr
                  key={row.project_code}
                  className="border-t border-slate-100"
                >
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">
                      {row.project_code}
                    </div>
                    <div className="text-sm text-slate-500">
                      {row.project_name}
                    </div>
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

                  <td className="p-4 text-slate-600">{item.unit}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No project usage found for this item
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Movement History
          </h2>

          <span className="text-sm text-slate-500">
            {movements?.length ?? 0} movement(s)
          </span>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Date</th>
              <th className="p-4">Type</th>
              <th className="p-4">Project</th>
              <th className="p-4">Qty</th>
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

                    <td className="p-4 text-slate-600">
                      {m.projects
                        ? `${m.projects.project_code} - ${m.projects.project_name}`
                        : "คลังกลาง"}
                    </td>

                    <td
                      className={
                        isNegative
                          ? "p-4 font-bold text-red-600"
                          : "p-4 font-bold text-green-700"
                      }
                    >
                      {isNegative ? "-" : "+"}
                      {Math.abs(Number(m.quantity))} {item.unit}
                    </td>

                    <td className="p-4 text-slate-600">{m.remark}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  No movements found for this item
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}