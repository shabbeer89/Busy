import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  // New method to sync with NextAuth session
  syncWithNextAuth: (sessionUser: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      syncWithNextAuth: (sessionUser) => {
        if (sessionUser && sessionUser.email) {
          // Create a User object from NextAuth session
          const sessionUserId = sessionUser.id;
          const fallbackId = crypto.randomUUID();
          console.log('🔍 [DEBUG] Auth store user ID check:', {
            sessionUserId,
            fallbackId: fallbackId,
            usingFallback: !sessionUserId
          });

          const user: User = {
            id: sessionUserId || fallbackId,
            email: sessionUser.email,
            name: sessionUser.name || sessionUser.email?.split('@')[0] || 'User',
            userType: get().user?.userType || 'creator', // Default to creator, should be updated via profile
            isVerified: true, // OAuth users are considered verified
            phoneNumber: sessionUser.phoneNumber,
            phoneVerified: sessionUser.phoneVerified,
            avatar: sessionUser.image,
            createdAt: get().user?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };
          set({ user, isAuthenticated: true });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);