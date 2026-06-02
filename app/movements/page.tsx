export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const params = await searchParams;

  const type = params.type ?? "ALL";
  const q = params.q?.trim().toLowerCase() ?? "";

  let query = supabase
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
        item_type,
        unit
      ),
      projects (
        project_code,
        project_name
      )
    `)
    .order("created_at", { ascending: false });

  if (type !== "ALL") {
    query = query.eq("movement_type", type);
  }

  const { data: rawMovements, error } = await query;

  if (error) return <div>Error: {error.message}</div>;

  const movements =
    q === ""
      ? rawMovements ?? []
      : (rawMovements ?? []).filter((m: any) => {
          const text = [
            m.movement_type,
            m.remark,
            m.items?.item_code,
            m.items?.item_name,
            m.items?.item_type,
            m.projects?.project_code,
            m.projects?.project_name,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(q);
        });

  function typeLink(value: string) {
    const href =
      q !== ""
        ? `/movements?type=${value}&q=${encodeURIComponent(q)}`
        : `/movements?type=${value}`;

    const className =
      type === value
        ? "rounded-xl bg-orange-500 px-4 py-2 text-white"
        : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-100";

    return { href, className };
  }

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
      return "rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold text-orange-700";
    }

    if (value === "ASSET") {
      return "rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700";
    }

    return "rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700";
  }

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

      <div className="mb-5 flex flex-wrap gap-3">
        <Link {...typeLink("ALL")}>All</Link>
        <Link {...typeLink("IN")}>IN</Link>
        <Link {...typeLink("OUT")}>OUT</Link>
        <Link {...typeLink("RETURN")}>RETURN</Link>
        <Link {...typeLink("SCRAP")}>SCRAP</Link>
        <Link {...typeLink("ADJUST")}>ADJUST</Link>
      </div>

      <form action="/movements" className="mb-5 flex gap-3">
        <input type="hidden" name="type" value={type} />

        <input
          name="q"
          defaultValue={q}
          placeholder="Search item, project, remark, type..."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800"
        >
          Search
        </button>

        {q !== "" && (
          <Link
            href={`/movements?type=${type}`}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-900">
            Stock Movements
          </h2>

          <span className="text-sm text-slate-500">
            {movements.length} movement(s)
          </span>
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
            {movements.length > 0 ? (
              movements.map((m: any) => {
                const isNegative =
                  m.movement_type === "OUT" ||
                  m.movement_type === "SCRAP";

                const itemType = m.items?.item_type ?? "CONSUMABLE";

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
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {m.items?.item_code}
                        </span>

                        <span className={itemTypeBadgeClass(itemType)}>
                          {itemType}
                        </span>
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
                        isNegative
                          ? "p-4 font-bold text-red-600"
                          : "p-4 font-bold text-green-700"
                      }
                    >
                      {isNegative ? "-" : "+"}
                      {Math.abs(Number(m.quantity))} {m.items?.unit}
                    </td>

                    <td className="p-4 text-slate-600">
                      {m.remark}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No movements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}