"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const { admin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (admin) {
      router.replace("/dashboard");
    } else {
      router.replace("/admin");
    }
  }, [admin, isLoading, router]);

  return (
    <div className="grid place-items-center min-h-screen">
      Loading...
    </div>
  );
}
