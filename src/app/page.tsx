"use client";
import { useEffect, useState } from "react";
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

  // Always show loader — this page's only job is to redirect
  return (
    <div className="grid place-items-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}