import "./globals.css";
import { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";
import ClientProviders from "./component/providers/ClientProviders";
import AppLayoutClient from "./component/providers/AppLayoutClient";

import { Metadata, Viewport } from "next";
import { getBrandSettings } from "@/store/brand/brand";
import { DEFAULT_BRAND } from "@/config/defaultBrand";
import ThemeInitializer from "./component/providers/ThemeInitializer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 1. REPLACE THE STATIC VIEWPORT WITH THIS DYNAMIC FUNCTION:
export async function generateViewport(): Promise<Viewport> {
  const res = await getBrandSettings();
  const settings = res?.data;

  return {
    themeColor: settings?.themeColor || DEFAULT_BRAND.themeColor || "#ffffff",
  };
}

function getCloudinaryPngUrl(url: string, size: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(/(\/upload\/)(v\d+\/)?/, `$1w_${size},h_${size},c_fill,f_png/$2`);
}

export async function generateMetadata(): Promise<Metadata> {
  const res = await getBrandSettings();
  const settings = res?.data;

  const rawFavicon = settings?.faviconUrl || DEFAULT_BRAND.faviconUrl;
  const appleUrl = settings?.icon192Url || getCloudinaryPngUrl(rawFavicon, 192);

  return {
    title: {
      template: `%s | ${settings?.shortName || DEFAULT_BRAND.shortName}`,
      default: settings?.appName || DEFAULT_BRAND.appName,
    },
    icons: {
      icon: [
        {
          url: rawFavicon,
          sizes: "any",
        },
      ],
      apple: [
        {
          url: appleUrl,
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    manifest: "/manifest.webmanifest",
  };
}

const poppins = Schibsted_Grotesk({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`min-h-screen w-full custom-scrollbar overflow-x-hidden ${poppins.className}`}
    >
      <body className="min-h-screen w-full bg-violet-100 overflow-x-hidden">
        <ThemeInitializer/>
        <ClientProviders>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ClientProviders>
      </body>
    </html>
  );
}