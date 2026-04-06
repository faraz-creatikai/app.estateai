"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/admin"); // go to admin login, NOT "/"
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="grid place-items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!admin) return null; // prevent flash

  return <>{children}</>;
}
