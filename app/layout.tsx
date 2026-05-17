import "./globals.css";
import Link from "next/link";
import AuthGuard from "./AuthGuard";

export const metadata = {
  title: "BTECH Stock System",
  description: "Drilling Inventory System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menus = [
    ["Dashboard", "/"],
    ["Add Item", "/add-item"],
    ["Projects", "/projects"],
    ["Add Project", "/add-project"],
    ["Stock In", "/stock-in"],
    ["Stock Out", "/stock-out"],
    ["Stock Adjust", "/stock-adjust"],
    ["Movements", "/movements"],
    ["Project Usage", "/project-usage"],
  ];

  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <div className="flex min-h-screen bg-slate-100">
            <aside className="w-72 bg-[#0f172a] text-white p-6">
              <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-wide">BTECH</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Stock Management
                </p>
              </div>

              <nav className="space-y-2">
                {menus.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block rounded-xl px-4 py-3 text-slate-300 hover:bg-orange-500 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </aside>

            <main className="flex-1 p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}