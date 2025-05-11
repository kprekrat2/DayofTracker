
"use client"; // Required for usePathname

import type { Metadata } from "next"; // Keep for potential static metadata, though dynamic might be better
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Static metadata can remain, but title/description might be dynamic per page
// export const metadata: Metadata = { 
//   title: "DayOff Tracker",
//   description: "Manage your day-off requests efficiently.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" className={inter.variable}>
      <head>
         {/* Default title, can be overridden by page specific metadata */}
        <title>DayOff Tracker</title>
        <meta name="description" content="Manage your day-off requests efficiently." />
      </head>
      <body className="font-sans antialiased">
        <DataProvider>
          <AuthProvider>
            {isLoginPage ? (
              <main className="flex-grow">{children}</main> 
            ) : (
              <AppLayout>
                {children}
              </AppLayout>
            )}
            <Toaster />
          </AuthProvider>
        </DataProvider>
      </body>
    </html>
  );
}
