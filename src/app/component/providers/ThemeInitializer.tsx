"use client";

import { useEffect } from "react";
import { getBrandSettings } from "@/store/brand/brand";
import { applyCrmTheme } from "@/app/utils/themePlatte";


export default function ThemeInitializer() {
  useEffect(() => {
    const initializeTheme = async () => {
      const res = await getBrandSettings();
      if (res?.success && res?.data?.primaryColor) {
        applyCrmTheme(res.data.primaryColor);
      }
    };
    initializeTheme();
  }, []);

  return null;
}