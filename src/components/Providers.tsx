"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--bg-secondary)",
            color: "var(--fg-primary)",
            border: "1px solid var(--border-color)",
          },
        }}
      />
    </ThemeProvider>
  );
}
