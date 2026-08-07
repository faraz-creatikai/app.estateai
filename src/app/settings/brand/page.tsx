"use client";

import React, { useEffect, useState } from "react";
import {
  getBrandSettings,
  updateBrandSettings,
  BrandSettingsData,
} from "@/store/brand/brand";
import { applyCrmTheme } from "@/app/utils/themePlatte";


type ImageFieldKey =
  | "favicon"
  | "logoSingle"
  | "logoText"
  | "splashScreen"
  | "icon192"
  | "icon512";

interface ImageConfig {
  label: string;
  key: ImageFieldKey;
  dbKey: keyof BrandSettingsData;
  helperText: string;
}

const IMAGE_FIELDS: ImageConfig[] = [
  {
    label: "Favicon (.ico/.png)",
    key: "favicon",
    dbKey: "faviconUrl",
    helperText: "Browser tab icon (32x32 or 64x64)",
  },
  {
    label: "Logo (Without Text)",
    key: "logoSingle",
    dbKey: "logoIconUrl",
    helperText: "Square icon for collapsed navigation bar",
  },
  {
    label: "Logo (With Text)",
    key: "logoText",
    dbKey: "logoTextUrl",
    helperText: "Full primary brand logo with domain name",
  },
  {
    label: "Splash Screen Logo",
    key: "splashScreen",
    dbKey: "splashScreenUrl",
    helperText: "Centered logo displayed during app launch",
  },
  {
    label: "PWA Icon (192x192)",
    key: "icon192",
    dbKey: "icon192Url",
    helperText: "Home screen icon for mobile devices",
  },
  {
    label: "PWA Icon (512x512)",
    key: "icon512",
    dbKey: "icon512Url",
    helperText: "Splash icon for mobile devices",
  },
];

export default function BrandSettingsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentSettings, setCurrentSettings] = useState<BrandSettingsData>({});

  // Form state
  const [appName, setAppName] = useState<string>("EstateAI Agent Platform");
  const [shortName, setShortName] = useState<string>("EstateAI");
  const [primaryColor, setPrimaryColor] = useState<string>("#0066cc"); // <-- NEW
  const [themeColor, setThemeColor] = useState<string>("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");

  // Selected files & instant browser previews
  const [files, setFiles] = useState<Record<ImageFieldKey, File | null>>({
    favicon: null,
    logoSingle: null,
    logoText: null,
    splashScreen: null,
    icon192: null,
    icon512: null,
  });
  const [previews, setPreviews] = useState<Record<ImageFieldKey, string>>({
    favicon: "",
    logoSingle: "",
    logoText: "",
    splashScreen: "",
    icon192: "",
    icon512: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const res = await getBrandSettings();
    if (res?.success && res?.data) {
      const data: BrandSettingsData = res.data;
      setCurrentSettings(data);
      setAppName(data.appName || "EstateAI Agent Platform");
      setShortName(data.shortName || "EstateAI");
      setPrimaryColor(data.primaryColor || "#0066cc");
      setThemeColor(data.themeColor || "#ffffff");
      setBackgroundColor(data.backgroundColor || "#ffffff");

      // Apply saved color theme to DOM
      if (data.primaryColor) {
        applyCrmTheme(data.primaryColor);
      }
    }
    setLoading(false);
  };

  // Trigger instant live preview when color picker changes
  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setPrimaryColor(newColor);
    applyCrmTheme(newColor); // Live updates --color-primary and all shades!
  };

  const handleFileChange = (
    key: ImageFieldKey,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => ({
        ...prev,
        [key]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("appName", appName);
    formData.append("shortName", shortName);
    formData.append("primaryColor", primaryColor); // <-- Add to FormData
    formData.append("themeColor", themeColor);
    formData.append("backgroundColor", backgroundColor);

    (Object.keys(files) as ImageFieldKey[]).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key] as File);
      }
    });

    const result = await updateBrandSettings(formData);
    if (result?.success) {
      alert("Brand settings updated successfully!");
      await loadSettings();
    } else {
      alert("Failed to update branding. Please check server logs.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)]">
        <p className="text-lg font-semibold text-[var(--color-primary)]">
          Loading brand settings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)]">
      <form
        onSubmit={handleSubmit}
        className="max-w-6xl mx-auto p-6 md:p-8 bg-[var(--color-bglight)] dark:bg-[var(--color-bgdark)] border border-[var(--color-primary-light)] rounded-2xl shadow-lg space-y-8"
      >
        {/* Header */}
        <div className="border-b border-[var(--color-muted)] pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)]">
            White-Label Brand & App Settings
          </h1>
          <p className="text-sm text-[var(--color-gray)] mt-1">
            Update your CRM identity, theme colors, and cloud-hosted logos.
          </p>
        </div>

        {/* General Text & Theme Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. EstateAI Agent Platform"
              className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-lg bg-[var(--color-childbglight)] dark:bg-[var(--color-childbgdark)] text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] mb-2">
              Short Name (for PWA App Icon)
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. EstateAI"
              className="w-full px-4 py-2 border border-[var(--color-primary-light)] rounded-lg bg-[var(--color-childbglight)] dark:bg-[var(--color-childbgdark)] text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* NEW: CRM Primary Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] mb-2">
              CRM Primary Brand Color (UI Accent)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={handlePrimaryColorChange}
                className="h-10 w-16 p-1 border border-[var(--color-primary-light)] rounded-lg bg-[var(--color-childbglight)] dark:bg-[var(--color-childbgdark)] cursor-pointer"
              />
              <span className="text-sm font-mono text-[var(--color-gray)]">
                {primaryColor}
              </span>
              <span className="text-xs text-[var(--color-primary)] font-semibold ml-2">
                • Auto-generates shades & updates live
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] mb-2">
              PWA Top Bar Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-10 w-16 p-1 border border-[var(--color-primary-light)] rounded-lg bg-[var(--color-childbglight)] dark:bg-[var(--color-childbgdark)] cursor-pointer"
              />
              <span className="text-sm font-mono text-[var(--color-gray)]">
                {themeColor}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] mb-2">
              PWA Splash Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-16 p-1 border border-[var(--color-primary-light)] rounded-lg bg-[var(--color-childbglight)] dark:bg-[var(--color-childbgdark)] cursor-pointer"
              />
              <span className="text-sm font-mono text-[var(--color-gray)]">
                {backgroundColor}
              </span>
            </div>
          </div>
        </div>

        {/* Image Upload Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)]">
            Brand Logos & Manifest Icons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGE_FIELDS.map((item) => {
              const existingUrl = currentSettings[item.dbKey] as
                | string
                | undefined;
              const displayUrl = previews[item.key] || existingUrl;

              return (
                <div
                  key={item.key}
                  className="p-4 border border-[var(--color-primary-light)] rounded-xl bg-[var(--color-childbglight)] dark:bg-[var(--color-childbgdark)] flex flex-col justify-between"
                >
                  <div>
                    <label className="block text-sm font-bold text-[var(--color-txtdark)] dark:text-[var(--color-txtlight)] mb-1">
                      {item.label}
                    </label>
                    <p className="text-xs text-[var(--color-gray)] mb-4">
                      {item.helperText}
                    </p>

                    <div className="w-full h-36 bg-white dark:bg-black/40 border border-dashed border-[var(--color-primary)] rounded-lg flex items-center justify-center p-2 mb-4 overflow-hidden">
                      {displayUrl ? (
                        <img
                          src={displayUrl}
                          alt={item.label}
                          className="max-h-28 max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[var(--color-gray)]">
                          No asset uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  <label className="cursor-pointer text-center py-2 px-3 text-xs font-semibold rounded-lg bg-[var(--color-primary)] text-[var(--color-txtlight)] hover:bg-[var(--color-primary-dark)] transition">
                    Choose New File
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/x-icon, image/svg+xml, image/webp"
                      onChange={(e) => handleFileChange(item.key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-6 border-t border-[var(--color-muted)]">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 font-semibold rounded-xl bg-[var(--color-primary)] text-[var(--color-txtlight)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition shadow-md"
          >
            {submitting ? "Uploading to Cloudinary..." : "Save Brand Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}