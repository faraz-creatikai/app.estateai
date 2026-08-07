import React from "react";
import { getBrandSettings } from "@/store/brand/brand";

export default async function LogoDisplay() {
  const res = await getBrandSettings();
  const settings = res?.data;

  return (
    <div className="flex items-center">
      {settings?.logoTextUrl ? (
        <img
          src={settings.logoTextUrl}
          alt={settings?.appName || "Brand Logo"}
          className="h-10 w-auto object-contain"
        />
      ) : (
        <span className="text-xl font-bold text-[var(--color-primary)]">
          {settings?.shortName || "EstateAI"}
        </span>
      )}
    </div>
  );
}