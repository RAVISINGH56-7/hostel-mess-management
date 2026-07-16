"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem={true} storageKey="tiffin-theme">
        {children}
        <Toaster theme="dark" />
      </ThemeProvider>
    </SessionProvider>
  );
}