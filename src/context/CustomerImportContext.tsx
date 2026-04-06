"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface CustomerImportContextType {
    excelHeaders: string[];
    setExcelHeaders: (headers: string[]) => void;
    file: File | null;               // ADD
    setFile: (file: File | null) => void;
}

const CustomerImportContext = createContext<CustomerImportContextType | undefined>(undefined);

export function CustomerImportProvider({ children }: { children: ReactNode }) {
    const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
    const [file, setFile] = useState<File | null>(null);

    return (
        <CustomerImportContext.Provider value={{
            excelHeaders, setExcelHeaders, file,                // ADD
            setFile
        }}>
            {children}
        </CustomerImportContext.Provider>
    );
}

export function useCustomerImport() {
    const context = useContext(CustomerImportContext);
    if (!context) {
        throw new Error("useCustomerImport must be used inside CustomerImportProvider");
    }
    return context;
}
