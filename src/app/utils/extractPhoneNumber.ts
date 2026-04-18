export const extractPhoneNumber = (text: string): string | null => {
  if (!text) return null;

  // remove common separators to simplify matching
  const cleaned = text.replace(/[\s\-().]/g, " ");

  // match patterns (10–13 digits with optional country code)
  const matches = cleaned.match(/(\+?\d[\d\s]{8,14}\d)/g);

  if (!matches) return null;

  for (let raw of matches) {
    // keep only digits
    const digits = raw.replace(/\D/g, "");

    // ✅ Indian numbers (10 digits or with 91 prefix)
    if (digits.length === 10) return digits;

    if (digits.length === 12 && digits.startsWith("91")) {
      return digits.slice(2);
    }

    // fallback: take last 10 digits if long number
    if (digits.length > 10) {
      return digits.slice(-10);
    }
  }

  return null;
};