import { MetadataRoute } from "next";
import { getBrandSettings } from "@/store/brand/brand";
import { DEFAULT_BRAND } from "@/config/defaultBrand";

export const dynamic = "force-dynamic";

// 1. Changed to c_pad so rectangular/wide logos are padded into a perfect square instead of cropped
function getCloudinaryPngUrl(url: string, size: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace(/(\/upload\/)(v\d+\/)?/, `$1w_${size},h_${size},c_pad,f_png/$2`);
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const res = await getBrandSettings();
  const settings = res?.data;

  const rawFavicon = settings?.faviconUrl || DEFAULT_BRAND.faviconUrl;
  
  // 2. Pick the raw URL first
  const raw192 = settings?.icon192Url || rawFavicon;
  const raw512 = settings?.splashScreenUrl || settings?.icon512Url || rawFavicon;

  // 3. ALWAYS pass both URLs through Cloudinary to guarantee exact 192x192 and 512x512 dimensions
  const icon192 = getCloudinaryPngUrl(raw192, 192);
  const icon512 = getCloudinaryPngUrl(raw512, 512);

  return {
    name: settings?.appName || DEFAULT_BRAND.appName,
    short_name: settings?.shortName || DEFAULT_BRAND.shortName,
    description: `${settings?.appName || DEFAULT_BRAND.appName} Application`,
    start_url: "/",
    display: "standalone",
    background_color: settings?.backgroundColor || "#ffffff",
    theme_color: settings?.themeColor || "#ffffff",
    icons: [
      {
        src: icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}