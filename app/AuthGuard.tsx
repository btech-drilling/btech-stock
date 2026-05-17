"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checking, setChecking] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    async function checkUser() {

      // อนุญาตหน้า login
      if (pathname === "/login") {
        setChecking(false);
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      setChecking(false);
    }

    checkUser();
  }, [pathname]);

  if (checking) {
    return (
      <div className="p-8">
        Checking login...
      </div>
    );
  }

  return <>{children}</>;
}