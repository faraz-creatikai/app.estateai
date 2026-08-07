/**
 * Lightens or darkens a hex color by a percentage (-100 to 100)
 */
function adjustColorBrightness(hex: string, percent: number): string {
  let num = parseInt(hex.replace("#", ""), 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Mixes a hex color with white to create soft pastel/light backgrounds
 */
function tintWithWhite(hex: string, weight: number): string {
  let num = parseInt(hex.replace("#", ""), 16);
  if (isNaN(num)) return hex;

  let r = num >> 16;
  let g = (num >> 8) & 0x00ff;
  let b = num & 0x0000ff;

  r = Math.round(r + (255 - r) * weight);
  g = Math.round(g + (255 - g) * weight);
  b = Math.round(b + (255 - b) * weight);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Generates the full CSS variable palette and applies it to <html />
 */
export function applyCrmTheme(baseHex: string) {
  if (!typeof window || !baseHex.startsWith("#") || baseHex.length < 7) return;

  const root = document.documentElement;

  // Calculate shades
  const primary = baseHex;
  const primaryDark = adjustColorBrightness(baseHex, -15);
  const primaryDarker = adjustColorBrightness(baseHex, -30);
  const primaryLight = tintWithWhite(baseHex, 0.75);
  const primaryLighter = tintWithWhite(baseHex, 0.88);
  const accent = tintWithWhite(baseHex, 0.6);
  const muted = tintWithWhite(baseHex, 0.8);

  // Apply to :root CSS variables dynamically
  root.style.setProperty("--color-primary", primary);
  root.style.setProperty("--color-primary-dark", primaryDark);
  root.style.setProperty("--color-primary-darker", primaryDarker);
  root.style.setProperty("--color-primary-light", primaryLight);
  root.style.setProperty("--color-primary-lighter", primaryLighter);

  // Sync secondary/accent with primary variations
  root.style.setProperty("--color-secondary", primary);
  root.style.setProperty("--color-secondary-dark", primaryDark);
  root.style.setProperty("--color-secondary-darker", primaryDarker);
  root.style.setProperty("--color-secondary-light", primaryLight);

  root.style.setProperty("--color-accent", accent);
  root.style.setProperty("--color-muted", muted);
  root.style.setProperty("--table", primary);
}