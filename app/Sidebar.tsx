"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [stockOpen, setStockOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  function go(href: string) {
    if (pathname !== href) {
      router.push(href);
    }
  }

  function linkClass(href: string) {
    const active =
      pathname === href || (href !== "/" && pathname.startsWith(href));

    return active
      ? "w-full rounded-lg bg-orange-500 px-4 py-2 text-left font-semibold text-white"
      : "w-full rounded-lg px-4 py-2 text-left text-slate-400 hover:bg-orange-500 hover:text-white";
  }

  function groupButtonClass() {
    return "flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold text-slate-300 hover:bg-slate-800";
  }

  return (
    <aside className="w-72 bg-[#0f172a] p-6 text-white">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-wide">BTECH</h1>
        <p className="mt-1 text-sm text-slate-400">Stock Management</p>
      </div>

      <nav className="space-y-2">
        <button onClick={() => go("/")} className={linkClass("/")}>
          Dashboard
        </button>

        <button
          onClick={() => setStockOpen(!stockOpen)}
          className={groupButtonClass()}
        >
          <span>{stockOpen ? "▼" : "▶"} Stock</span>
        </button>

        {stockOpen && (
          <div className="ml-5 space-y-1 border-l border-slate-700 pl-4">
            <button onClick={() => go("/stock-in")} className={linkClass("/stock-in")}>
              Stock In
            </button>

            <button onClick={() => go("/stock-out")} className={linkClass("/stock-out")}>
              Stock Out
            </button>

            <button onClick={() => go("/stock-return")} className={linkClass("/stock-return")}>
              Stock Return
            </button>

            <button onClick={() => go("/stock-scrap")} className={linkClass("/stock-scrap")}>
              Stock Scrap
            </button>

            <button onClick={() => go("/stock-adjust")} className={linkClass("/stock-adjust")}>
              Stock Adjust
            </button>
          </div>
        )}

        <button
          onClick={() => setManagementOpen(!managementOpen)}
          className={groupButtonClass()}
        >
          <span>{managementOpen ? "▼" : "▶"} Management</span>
        </button>

        {managementOpen && (
          <div className="ml-5 space-y-1 border-l border-slate-700 pl-4">
            <button onClick={() => go("/projects")} className={linkClass("/projects")}>
              Projects
            </button>

            <button onClick={() => go("/add-project")} className={linkClass("/add-project")}>
              Add Project
            </button>

            <button onClick={() => go("/add-item")} className={linkClass("/add-item")}>
              Add Item
            </button>
          </div>
        )}

        <button
          onClick={() => setReportsOpen(!reportsOpen)}
          className={groupButtonClass()}
        >
          <span>{reportsOpen ? "▼" : "▶"} Reports</span>
        </button>

        {reportsOpen && (
          <div className="ml-5 space-y-1 border-l border-slate-700 pl-4">
            <button onClick={() => go("/movements")} className={linkClass("/movements")}>
              Movements
            </button>

            <button onClick={() => go("/project-usage")} className={linkClass("/project-usage")}>
              Project Summary
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}