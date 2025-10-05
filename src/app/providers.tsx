"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { convex } from "@/lib/convex";
import { Toaster } from "@/components/toast-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
      <Toaster />
    </ConvexProvider>
  );
}