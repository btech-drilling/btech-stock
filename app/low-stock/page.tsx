export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function LowStockPage() {
  const { data: items, error } = await supabase
    .from("items")
    .select(`
      id,
      item_code,
      item_name,
      item_type,
      category,
      unit,
      minimum_stock,
      current_stock,
      image_url
    `)
    .order("item_code", { ascending: true });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const lowStockItems = (items ?? [])
    .filter(
      (item) =>
        Number(item.current_stock ?? 0) <= Number(item.minimum_stock ?? 0)
    )
    .sort(
      (a, b) =>
        Number(a.current_stock ?? 0) - Number(b.current_stock ?? 0)
    );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-red-600">
            STOCK ALERT
          </p>

          <h1 className="text-4xl font-bold text-slate-900">
            Low Stock Items
          </h1>

          <p className="mt-1 text-slate-500">
            All items where current stock is less than or equal to minimum stock
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white hover:bg-slate-800"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-100 bg-red-50 p-5">
          <h2 className="text-xl font-bold text-red-700">
            Total Low Stock: {lowStockItems.length}
          </h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 text-left text-sm text-slate-600">
              <th className="p-4">Image</th>
              <th className="p-4">Code</th>
              <th className="p-4">Item Name</th>
              <th className="p-4">Type</th>
              <th className="p-4">Category</th>
              <th className="p-4">Unit</th>
              <th className="p-4 text-right">Current Stock</th>
              <th className="p-4 text-right">Minimum Stock</th>
              <th className="p-4 text-right">Shortage</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {lowStockItems.map((item) => {
              const currentStock = Number(item.current_stock ?? 0);
              const minimumStock = Number(item.minimum_stock ?? 0);
              const shortage = Math.max(minimumStock - currentStock, 0);

              return (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="p-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.item_name ?? item.item_code}
                        className="h-14 w-14 rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </td>

                  <td className="p-4 font-semibold text-slate-800">
                    {item.item_code}
                  </td>

                  <td className="p-4 text-slate-700">
                    {item.item_name}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.item_type ?? "CONSUMABLE"}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.category}
                  </td>

                  <td className="p-4 text-slate-600">
                    {item.unit}
                  </td>

                  <td className="p-4 text-right font-bold text-red-600">
                    {currentStock}
                  </td>

                  <td className="p-4 text-right text-slate-600">
                    {minimumStock}
                  </td>

                  <td className="p-4 text-right font-bold text-orange-600">
                    {shortage}
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
                    </div>
                  </td>
                </tr>
              );
            })}

            {lowStockItems.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-slate-400">
                  No low stock items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}