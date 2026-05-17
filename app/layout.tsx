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
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          <div className="flex min-h-screen">
            <aside className="w-64 bg-black text-white p-6">
              <h1 className="text-2xl font-bold mb-8">BTECH</h1>

              <nav className="space-y-4">
                <Link href="/" className="block hover:text-yellow-400">
                  Dashboard
                </Link>

                <Link href="/add-item" className="block hover:text-yellow-400">
                  Add Item
                </Link>

                <Link href="/projects" className="block hover:text-yellow-400">
                  Projects
                </Link>

                <Link href="/add-project" className="block hover:text-yellow-400">
                  Add Project
                </Link>

                <Link href="/stock-in" className="block hover:text-yellow-400">
                  Stock In
                </Link>

                <Link href="/stock-out" className="block hover:text-yellow-400">
                  Stock Out
                </Link>

                <Link href="/movements" className="block hover:text-yellow-400">
                  Movements
                </Link>

                <Link href="/project-usage" className="block hover:text-yellow-400">
                  Project Usage
                </Link>
              </nav>
            </aside>

            <main className="flex-1 p-8 bg-gray-100">
              {children}
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}