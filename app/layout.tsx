import "./globals.css";
import AuthGuard from "./AuthGuard";
import Sidebar from "./Sidebar";

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
          <div className="flex min-h-screen bg-slate-100">
            <Sidebar />

            <main className="flex-1 p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}