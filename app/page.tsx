export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

export default async function Home() {
  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*")
    .order("item_code", { ascending: true });

  const { data: projects } = await supabase.from("projects").select("*");

  const { data: movements } = await supabase
    .from("stock_movements")
    .select(`
      movement_type,
      quantity,
      project:projects(project_code, project_name),
      item:items(item_code, item_type, unit_cost)
    `);

  if (itemsError) {
    return <div>Error: {itemsError.message}</div>;
  }

  const itemList = items ?? [];
  const projectList = projects ?? [];
  const movementList = movements ?? [];

  const allLowStockList = itemList
    .filter(
      (item) =>
        Number(item.current_stock ?? 0) <= Number(item.minimum_stock ?? 0)
    )
    .sort(
      (a, b) =>
        Number(a.current_stock ?? 0) - Number(b.current_stock ?? 0)
    );

  const lowStockList = allLowStockList.slice(0, 5);
  const lowStockItems = allLowStockList.length;

  const totalInventoryValue = itemList.reduce(
    (sum, item) =>
      sum + Number(item.current_stock ?? 0) * Number(item.unit_cost ?? 0),
    0
  );

  const projectSummary = movementList.reduce((acc: any, m: any) => {
    const projectCode = m.project?.project_code;

    if (!projectCode) return acc;

    const projectName = m.project?.project_name ?? "No Project";
    const itemCode = m.item?.item_code;
    const itemType = m.item?.item_type;
    const unitCost = Number(m.item?.unit_cost ?? 0);
    const qty = Math.abs(Number(m.quantity ?? 0));
    const type = m.movement_type;

    if (!acc[projectCode]) {
      acc[projectCode] = {
        projectCode,
        projectName,
        totalCost: 0,
        items: {},
      };
    }

    if (!itemCode) return acc;

    if (!acc[projectCode].items[itemCode]) {
      acc[projectCode].items[itemCode] = {
        itemType,
        unitCost,
        netQty: 0,
        scrapQty: 0,
        totalCost: 0,
      };
    }

    const item = acc[projectCode].items[itemCode];

    if (type === "OUT") item.netQty += qty;
    if (type === "RETURN") item.netQty -= qty;

    if (type === "SCRAP") {
      item.scrapQty += qty;

      if (itemType === "CONSUMABLE") {
        item.netQty += qty;
      }
    }

    if (itemType === "ASSET") {
      item.totalCost = item.scrapQty * unitCost;
    } else {
      item.totalCost = item.netQty * unitCost;
    }

    acc[projectCode].totalCost = Object.values(acc[projectCode].items).reduce(
      (sum: number, i: any) => sum + i.totalCost,
      0
    );

    return acc;
  }, {});

  const allProjectCostList = Object.values(projectSummary).sort(
    (a: any, b: any) => b.totalCost - a.totalCost
  );

  const projectCostList = allProjectCostList.slice(0, 5);

  const totalProjectCost = allProjectCostList.reduce(
    (sum: number, p: any) => sum + p.totalCost,
    0
  );

  const maxProjectCost = Math.max(
    ...projectCostList.map((p: any) => p.totalCost),
    1
  );

  const valueByType = [
    {
      label: "Consumable",
      value: itemList
        .filter((item) => item.item_type === "CONSUMABLE")
        .reduce(
          (sum, item) =>
            sum + Number(item.current_stock ?? 0) * Number(item.unit_cost ?? 0),
          0
        ),
    },
    {
      label: "Asset",
      value: itemList
        .filter((item) => item.item_type === "ASSET")
        .reduce(
          (sum, item) =>
            sum + Number(item.current_stock ?? 0) * Number(item.unit_cost ?? 0),
          0
        ),
    },
    {
      label: "Tool",
      value: itemList
        .filter((item) => item.item_type === "TOOL")
        .reduce(
          (sum, item) =>
            sum + Number(item.current_stock ?? 0) * Number(item.unit_cost ?? 0),
          0
        ),
    },
  ];

  const maxTypeValue = Math.max(...valueByType.map((v) => v.value), 1);

  function renderItemTypeBadge(itemType: string) {
    if (itemType === "TOOL") {
      return (
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          TOOL
        </span>
      );
    }

    if (itemType === "ASSET") {
      return (
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          ASSET
        </span>
      );
    }

    return (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
        CONSUMABLE
      </span>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            BTECH INVENTORY CONTROL
          </p>

          <h1 className="text-4xl font-bold text-slate-900">Dashboard</h1>

          <p className="mt-1 text-slate-500">
            Inventory value, low stock, project cost, and stock analytics
          </p>
        </div>

        <Link
          href="/add-item"
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow hover:bg-orange-600"
        >
          + Add Item
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Inventory Value</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            ฿{totalInventoryValue.toLocaleString()}
          </h2>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="text-sm text-red-500">Low Stock Items</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {lowStockItems}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Projects</p>
          <h2 className="mt-2 text-3xl font-bold text-blue-700">
            {projectList.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Project Cost</p>
          <h2 className="mt-2 text-3xl font-bold text-green-700">
            ฿{totalProjectCost.toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Top Project Cost
              </h2>
              <p className="text-sm text-slate-500">
                Showing {projectCostList.length} of {allProjectCostList.length} projects
              </p>
            </div>

            <Link
              href="/project-usage"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4">
            {projectCostList.map((p: any) => (
              <div key={p.projectCode}>
                <div className="mb-1 flex justify-between text-sm">
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

            {projectCostList.length === 0 && (
              <p className="text-sm text-slate-400">No project cost data</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-red-700">
                Low Stock Items
              </h2>
              <p className="text-sm text-red-500">
                Showing {lowStockList.length} of {lowStockItems} items
              </p>
            </div>

            <Link
              href="/low-stock"
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockList.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item.item_code}
                    </p>
                    <p className="text-sm text-slate-500">{item.item_name}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      {item.current_stock}
                    </p>
                    <p className="text-xs text-slate-500">
                      Min {item.minimum_stock}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {lowStockList.length === 0 && (
              <p className="text-sm text-slate-400">No low stock items</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Stock Value by Type
            </h2>
            <p className="text-sm text-slate-500">
              Current stock value grouped by item type
            </p>
          </div>

          <div className="space-y-4">
            {valueByType.map((v) => (
              <div key={v.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {v.label}
                  </span>

                  <span className="font-bold text-slate-800">
                    ฿{v.value.toLocaleString()}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{
                      width: `${(v.value / maxTypeValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">Items Master</h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Code</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Category</th>
              <th className="p-4">Unit</th>
              <th className="p-4 text-right">Unit Cost (฿)</th>
              <th className="p-4 text-right">Min Stock</th>
              <th className="p-4 text-right">Current Stock</th>
              <th className="p-4 text-right">Stock Value (฿)</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {itemList.map((item) => {
              const isLowStock =
                Number(item.current_stock ?? 0) <=
                Number(item.minimum_stock ?? 0);

              const itemType = item.item_type ?? "CONSUMABLE";

              const stockValue =
                Number(item.current_stock ?? 0) *
                Number(item.unit_cost ?? 0);

              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold text-slate-800">
                    {item.item_code}
                  </td>

                  <td className="p-4 text-slate-700">{item.item_name}</td>

                  <td className="p-4">{renderItemTypeBadge(itemType)}</td>

                  <td className="p-4 text-slate-600">{item.category}</td>

                  <td className="p-4 text-slate-600">{item.unit}</td>

                  <td className="p-4 text-right text-slate-700">
                    ฿{Number(item.unit_cost ?? 0).toLocaleString()}
                  </td>

                  <td className="p-4 text-right text-slate-600">
                    {item.minimum_stock}
                  </td>

                  <td className="p-4 text-right">
                    <span
                      className={
                        isLowStock
                          ? "font-bold text-red-600"
                          : "font-bold text-green-700"
                      }
                    >
                      {item.current_stock}
                    </span>

                    {isLowStock && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        LOW
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right font-semibold text-blue-600">
                    ฿{stockValue.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-3">
                      <Link
                        href={`/items/${item.id}/card`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        Card
                      </Link>

                      <Link
                        href={`/edit-item/${item.id}`}
                        className="font-semibold text-orange-600 hover:underline"
                      >
                        Edit
                      </Link>

                      <DeleteButton id={item.id} />
                    </div>
                  </td>
                </tr>
              );
            })}

            {itemList.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-400">
                  No items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}