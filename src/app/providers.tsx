"use client";

import { useEffect, useRef } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { convex } from "@/lib/convex";
import { Toaster } from "@/components/toast-provider";
import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/stores/auth-store";

// Internal component to sync NextAuth session with Zustand store
function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const syncWithNextAuth = useAuthStore((state) => state.syncWithNextAuth);
  const logout = useAuthStore((state) => state.logout);
  const previousSessionRef = useRef<any>(null);

  useEffect(() => {
    // Prevent infinite loops by checking if session actually changed
    if (previousSessionRef.current !== session) {
      previousSessionRef.current = session;

      if (session?.user && status === "authenticated") {
        // Sync NextAuth session with Zustand store
        syncWithNextAuth(session.user);
      } else if (status === "unauthenticated" && previousSessionRef.current?.user) {
        // User signed out from NextAuth, also sign out from Zustand
        logout();
      }
    }
  }, [session, status, syncWithNextAuth, logout]);

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