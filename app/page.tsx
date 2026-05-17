export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

export default async function Home() {
  const { data: items, error } = await supabase
    .from("items")
    .select("*")
    .order("item_code", { ascending: true });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const totalItems = items?.length ?? 0;

  const lowStockItems =
    items?.filter(
      (item) =>
        Number(item.current_stock ?? 0) <= Number(item.minimum_stock ?? 0)
    ).length ?? 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            BTECH INVENTORY CONTROL
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-slate-500">
            Drilling equipment, consumables, and project stock overview
          </p>
        </div>

        <Link
          href="/add-item"
          className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow hover:bg-orange-600"
        >
          + Add Item
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Total Items</p>
          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            {totalItems}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Low Stock Items</p>
          <h2 className="mt-2 text-4xl font-bold text-red-600">
            {lowStockItems}
          </h2>
        </div>

        <div className="rounded-2xl bg-slate-900 p-6 shadow-sm">
          <p className="text-sm text-slate-300">System Status</p>
          <h2 className="mt-2 text-2xl font-bold text-orange-400">
            Online
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Items Master
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Code</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Unit</th>
              <th className="p-4">Min Stock</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {items?.map((item) => {
              const isLowStock =
                Number(item.current_stock ?? 0) <=
                Number(item.minimum_stock ?? 0);

              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold text-slate-800">
                    {item.item_code}
                  </td>

                  <td className="p-4 text-slate-700">
                    {item.item_name}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.category}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.unit}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.minimum_stock}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
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
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                          LOW
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 flex gap-3">
                    <Link
                      href={`/edit-item/${item.id}`}
                      className="font-semibold text-orange-600 hover:underline"
                    >
                      Edit
                    </Link>

                    <DeleteButton id={item.id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}