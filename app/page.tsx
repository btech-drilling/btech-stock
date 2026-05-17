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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <Link
          href="/add-item"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Add Item
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Total Items</p>
          <h2 className="text-3xl font-bold">{totalItems}</h2>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">Low Stock Items</p>
          <h2 className="text-3xl font-bold text-red-600">{lowStockItems}</h2>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-gray-500">System Status</p>
          <h2 className="text-xl font-bold text-green-600">Online</h2>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Items Master</h2>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">Code</th>
              <th className="p-3">Item Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Min Stock</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {items?.map((item) => {
              const isLowStock =
                Number(item.current_stock ?? 0) <=
                Number(item.minimum_stock ?? 0);

              return (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.item_code}</td>
                  <td className="p-3">{item.item_name}</td>
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">{item.unit}</td>
                  <td className="p-3">{item.minimum_stock}</td>

<td
  className={
    isLowStock
      ? "p-3 font-bold text-red-600"
      : "p-3 font-semibold"
  }
>
  <div className="flex items-center gap-2">

    <span>
      {item.current_stock}
    </span>

    {isLowStock && (
      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
        LOW
      </span>
    )}

  </div>
</td>

                  <td className="p-3 flex gap-3">
                    <Link
                      href={`/edit-item/${item.id}`}
                      className="text-blue-600 hover:underline"
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