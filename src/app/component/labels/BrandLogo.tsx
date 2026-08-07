"use client";

import React, { useEffect, useState } from "react";
import { getBrandSettings, BrandSettingsData } from "@/store/brand/brand";
import { ShieldUser } from "lucide-react";
import { DEFAULT_BRAND } from "@/config/defaultBrand";

interface BrandLogoProps {
  variant?: "text" | "icon";
  className?: string;
  alt?: string;
}

export default function BrandLogo({
  variant = "text",
  className = "h-10 w-auto object-contain",
  alt = "App Logo",
}: BrandLogoProps) {
  const [settings, setSettings] = useState<BrandSettingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getBrandSettings().then((res) => {
      if (isMounted && res?.success && res?.data) {
        setSettings(res.data);
      }
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className={`animate-pulse bg-white/20 rounded ${className}`} />;
  }

  // 1. Resolve URLs first: check DB -> then check DEFAULT_BRAND
  const iconUrl = settings?.logoIconUrl || DEFAULT_BRAND.logoIconUrl;
  const textUrl = settings?.logoTextUrl || DEFAULT_BRAND.logoTextUrl;

  // 2. Render Icon Only (For Collapsed Sidebar)
  if (variant === "icon") {
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt={settings?.shortName || alt}
          className={className}
        />
      );
    }
    return <ShieldUser className="w-6 h-6 text-[var(--color-primary)]" />;
  }

  // 3. Render Full Logo with Text (For Login, Register, and Expanded Sidebar)
  if (textUrl) {
    return (
      <img
        src={textUrl}
        alt={settings?.appName || alt}
        className={className}
      />
    );
  }

  // Fallback text only if BOTH database and DEFAULT_BRAND URLs are empty/null
  return (
    <span className="text-xl font-bold text-[var(--color-primary)]">
      {settings?.shortName || "EstateAI"}
    </span>
  );
}