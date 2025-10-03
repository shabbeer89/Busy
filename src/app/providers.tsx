"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { convex } from "@/lib/convex";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "@/components/toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <ThemeProvider defaultTheme="system" storageKey="businessmatch-ui-theme">
        {children}
        <Toaster />
      </ThemeProvider>
    </ConvexProvider>
  );
}