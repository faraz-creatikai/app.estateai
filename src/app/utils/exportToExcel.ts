import * as XLSX from "xlsx";

export const exportToExcel = (
  data: any[],
  fileName: string = "customers"
) => {
  // Convert JSON → worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
