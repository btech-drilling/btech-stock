import "./globals.css";
import AuthGuard from "./AuthGuard";
import Workspace from "./Workspace";

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
    <html lang="th">
      <body>
        <AuthGuard>
          <Workspace>{children}</Workspace>
        </AuthGuard>
      </body>
    </html>
  );
}