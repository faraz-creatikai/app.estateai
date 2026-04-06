"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface ContactImportContextType {
  excelHeaders: string[];
  setExcelHeaders: (headers: string[]) => void;

  file: File | null;
  setFile: (file: File | null) => void;
}

const ContactImportContext = createContext<ContactImportContextType | undefined>(undefined);

export function ContactImportProvider({ children }: { children: ReactNode }) {
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  return (
    <ContactImportContext.Provider
      value={{
        excelHeaders,
        setExcelHeaders,
        file,
        setFile,
      }}
    >
      {children}
    </ContactImportContext.Provider>
  );
}

export function useContactImport() {
  const context = useContext(ContactImportContext);
  if (!context) {
    throw new Error("useContactImport must be used inside ContactImportProvider");
  }
  return context;
}
