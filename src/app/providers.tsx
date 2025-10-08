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
  const setLoading = useAuthStore((state) => state.setLoading);
  const previousSessionRef = useRef<any>(null);

  useEffect(() => {
    // Set loading to true when component mounts and while checking auth
    setLoading(true);

    // Prevent infinite loops by checking if session actually changed
    if (previousSessionRef.current !== session) {
      previousSessionRef.current = session;

      if (session?.user && status === "authenticated") {
        // Sync NextAuth session with Zustand store
        syncWithNextAuth(session.user);
        setLoading(false);
      } else if (status === "unauthenticated" && previousSessionRef.current?.user) {
        // User signed out from NextAuth, also sign out from Zustand
        logout();
        setLoading(false);
      } else if (status === "unauthenticated" && !previousSessionRef.current?.user) {
        // No session and no previous session - definitively not authenticated
        setLoading(false);
      }
    }
  }, [session, status, syncWithNextAuth, logout, setLoading]);

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