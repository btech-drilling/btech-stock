"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const [stockOpen, setStockOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  function linkClass(href: string) {
    const active =
      pathname === href || (href !== "/" && pathname.startsWith(href));

    return active
      ? "block rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white"
      : "block rounded-lg px-4 py-2 text-slate-400 hover:bg-orange-500 hover:text-white";
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
        <Link href="/" prefetch={false} className={linkClass("/")}>
          Dashboard
        </Link>

        <button
          onClick={() => setStockOpen(!stockOpen)}
          className={groupButtonClass()}
        >
          <span>{stockOpen ? "▼" : "▶"} Stock</span>
        </button>

        {stockOpen && (
          <div className="ml-5 space-y-1 border-l border-slate-700 pl-4">
            <Link
              href="/stock-in"
              prefetch={false}
              className={linkClass("/stock-in")}
            >
              Stock In
            </Link>

            <Link
              href="/stock-out"
              prefetch={false}
              className={linkClass("/stock-out")}
            >
              Stock Out
            </Link>

            <Link
              href="/stock-return"
              prefetch={false}
              className={linkClass("/stock-return")}
            >
              Stock Return
            </Link>

            <Link
              href="/stock-scrap"
              prefetch={false}
              className={linkClass("/stock-scrap")}
            >
              Stock Scrap
            </Link>

            <Link
              href="/stock-adjust"
              prefetch={false}
              className={linkClass("/stock-adjust")}
            >
              Stock Adjust
            </Link>
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
            <Link
              href="/projects"
              prefetch={false}
              className={linkClass("/projects")}
            >
              Projects
            </Link>

            <Link
              href="/add-project"
              prefetch={false}
              className={linkClass("/add-project")}
            >
              Add Project
            </Link>

            <Link
              href="/add-item"
              prefetch={false}
              className={linkClass("/add-item")}
            >
              Add Item
            </Link>
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
            <Link
              href="/movements"
              prefetch={false}
              className={linkClass("/movements")}
            >
              Movements
            </Link>

            <Link
              href="/project-usage"
              prefetch={false}
              className={linkClass("/project-usage")}
            >
              Project Summary
            </Link>

            <Link
              href="/low-stock"
              prefetch={false}
              className={linkClass("/low-stock")}
            >
              Low Stock
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}