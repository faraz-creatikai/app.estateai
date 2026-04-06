"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function MasterProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only check redirect after auth finishes loading
    if (!isLoading) {
      if (!admin || admin.role !== "administrator") {
        router.push("/dashboard"); // Redirect if not logged in or not admin
      }
    }
  }, [admin, isLoading, router]);

  // Show loading screen while auth is checking
  if (isLoading || !admin) {
    return (
      <div className="grid place-items-center min-h-[calc(100vh-0px)] w-full text-gray-600">
        Loading page...
      </div>
    );
  }

  // Render children only if admin
  return <>{children}</>;
}
