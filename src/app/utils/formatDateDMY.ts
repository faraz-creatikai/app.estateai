export const formatDateDMY = (value: string): string => {
  if (!value) return "";

  let d: Date | null = null;

  // 1. ISO-like yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    d = new Date(value);
  }
  // 2. European dd-mm-yyyy
  else if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-").map(Number);
    d = new Date(year, month - 1, day);
  }

  if (!d || isNaN(d.getTime())) return "";

  // build dd-mm-yyyy
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();

  return `${day}-${month}-${year}`;
};