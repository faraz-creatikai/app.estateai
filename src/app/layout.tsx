import "./globals.css";
import { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";
import ClientProviders from "./component/providers/ClientProviders";
import AppLayoutClient from "./component/providers/AppLayoutClient";


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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="icon" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
        <title>Prime Consultancy Leads</title>
      </head>

      <body className="min-h-screen w-full bg-violet-100 overflow-x-hidden">
        <ClientProviders>
          <AppLayoutClient>{children}</AppLayoutClient>
        </ClientProviders>
      </body>
    </html>
  );
}