"use client";

import { useRouter } from "next/navigation";

export const useBackNavigation = (fallback: string = "/") => {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return goBack;
};
