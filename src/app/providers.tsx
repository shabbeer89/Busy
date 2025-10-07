"use client";

import { useEffect } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { convex } from "@/lib/convex";
import { Toaster } from "@/components/toast-provider";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

// Internal component to sync NextAuth session with Zustand store
function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const syncWithNextAuth = useAuthStore((state) => state.syncWithNextAuth);

  useEffect(() => {
    if (session?.user) {
      // Sync NextAuth session with Zustand store
      syncWithNextAuth(session.user);
    } else if (session === null) {
      // User signed out from NextAuth, also sign out from Zustand
      useAuthStore.getState().logout();
    }
  }, [session, syncWithNextAuth]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <AuthSync>
          {children}
        </AuthSync>
        <Toaster />
      </ConvexProvider>
    </SessionProvider>
  );
}