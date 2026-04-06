"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "@/theme/muiTheme";
import { CustomerImportProvider } from "@/context/CustomerImportContext";
import { ContactImportProvider } from "@/context/ContactImportContext";
import { CustomerFieldLabelProvider } from "@/context/customer/CustomerFieldLabelContext";
import { ThemeProviderCustom } from "@/context/ThemeContext";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProviderCustom>
        <CustomerImportProvider>
          <ContactImportProvider>
            <CustomerFieldLabelProvider>
              <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </CustomerFieldLabelProvider>
          </ContactImportProvider>
        </CustomerImportProvider>
      </ThemeProviderCustom>
    </AuthProvider>
  );
}