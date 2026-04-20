"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // ❌ NOT logged in → block all except dev login
    if (!admin && pathname !== "/system/maintenance/access/signup") {
      router.replace("/admin");
      return;
    }

    // ✅ Logged in → block dev login page
    if (admin && pathname === "/system/maintenance/access/signup") {
      router.replace("/dashboard");
      return;
    }

  }, [admin, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-screen">
        Loading...
      </div>
    );
  }

  // ❌ prevent rendering protected pages
  if (!admin && pathname !== "/mode/dev/login") return null;

  return <>{children}</>;
}