"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!admin && pathname !== "/system/maintenance/access/signup") {
      setIsRedirecting(true);
      router.replace("/admin");
      return;
    }

    if (admin && pathname === "/system/maintenance/access/signup") {
      setIsRedirecting(true);
      router.replace("/dashboard");
      return;
    }

    setIsRedirecting(false);
  }, [admin, isLoading, pathname, router]);

  // Show loader while auth is resolving OR while redirect is in flight
  if (isLoading || isRedirecting) {
    return (
      <div className="grid place-items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (redirect is already queued above)
  if (!admin) return null;

  return <>{children}</>;
}