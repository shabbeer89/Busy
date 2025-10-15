"use client";

import { useAuthStore } from "@/stores/auth-store";
import { CreateUserData, User } from "@/types";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, getSession } from "next-auth/react";
import { createClient } from "@/lib/supabase-client";
import { useEffect } from "react";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();

  // Sync with NextAuth session on mount
  useEffect(() => {
    const syncSession = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          const sessionUserId = (session.user as any).id;
          const fallbackId = crypto.randomUUID();
          console.log('🔍 [DEBUG] Session sync user ID check:', {
            sessionUserId,
            fallbackId: fallbackId,
            usingFallback: !sessionUserId
          });

          const userData: User = {
            id: sessionUserId || fallbackId,
            email: session.user.email!,
            name: session.user.name || session.user.email?.split('@')[0] || 'User',
            avatar: session.user.image || undefined,
            userType: (session.user as any).user_type || 'creator',
            isVerified: (session.user as any).is_verified || true,
            phoneVerified: (session.user as any).phone_verified || false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error syncing session:', error);
      }
    };

    syncSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // Use NextAuth sign in for email/password authentication
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: "Invalid email or password" };
      }

      // If successful, get the session and update store
      const session = await getSession();
      if (session?.user) {
        const sessionUserId = (session.user as any).id;
        const fallbackId = crypto.randomUUID();
        console.log('🔍 [DEBUG] SignIn user ID check:', {
          sessionUserId,
          fallbackId: fallbackId,
          usingFallback: !sessionUserId
        });

        const userData: User = {
          id: sessionUserId || fallbackId,
          email: session.user.email!,
          name: session.user.name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.image || undefined,
          userType: (session.user as any).user_type || 'creator',
          isVerified: (session.user as any).is_verified || true,
          phoneVerified: (session.user as any).phone_verified || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: "Authentication failed" };

    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Failed to sign in. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: CreateUserData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // Validate required fields
      if (!userData.email || !userData.name || !userData.password) {
        return { success: false, error: "Please fill in all required fields" };
      }

      // Use Supabase Auth for sign up
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone_number: userData.phoneNumber,
            user_type: userData.userType,
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user profile in our users table
        const { error: profileError } = await (supabase as any)
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            name: userData.name,
            phone_number: userData.phoneNumber,
            user_type: userData.userType,
            is_verified: false,
            phone_verified: false,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        const newUser: User = {
          id: data.user.id,
          email: userData.email,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          userType: userData.userType,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setUser(newUser);
        return { success: true };
      }

      return { success: false, error: "Failed to create account" };

    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "Failed to create account. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneNumber = async (phoneNumber: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // Validate OTP format
      if (!otp || otp.length !== 6) {
        return { success: false, error: "Please enter a valid 6-digit OTP" };
      }

      if (!user) {
        return { success: false, error: "No user found. Please sign in again." };
      }

      // Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Update phone verification status in users table
        const { error: updateError } = await (supabase as any)
          .from('users')
          .update({
            phone_verified: true,
            phone_number: phoneNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating phone verification:', updateError);
        }

        // Update local user state
        setUser({
          ...user,
          phoneVerified: true,
          phoneNumber,
          updatedAt: Date.now(),
        });

        return { success: true };
      }

      return { success: false, error: "Invalid OTP. Please try again." };

    } catch (error) {
      console.error("Phone verification error:", error);
      return { success: false, error: "Failed to verify phone. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      // Sign out from NextAuth
      await nextAuthSignOut({ redirect: false });

      // Also sign out from Supabase
      await supabase.auth.signOut();

      // Clear local state
      logout();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await nextAuthSignIn('google', { redirect: false });
      if (result?.error) {
        return { success: false, error: result.error };
      }

      // Sync session after successful sign in
      const session = await getSession();
      if (session?.user) {
        const sessionUserId = (session.user as any).id;
        const fallbackId = crypto.randomUUID();
        console.log('🔍 [DEBUG] Google signIn user ID check:', {
          sessionUserId,
          fallbackId: fallbackId,
          usingFallback: !sessionUserId
        });

        const userData: User = {
          id: sessionUserId || fallbackId,
          email: session.user.email!,
          name: session.user.name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.image || undefined,
          userType: (session.user as any).user_type || 'creator',
          isVerified: (session.user as any).is_verified || true,
          phoneVerified: (session.user as any).phone_verified || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setUser(userData);
      }

      return { success: true };
    } catch (error) {
      console.error("Google sign in error:", error);
      return { success: false, error: "Failed to sign in with Google" };
    } finally {
      setLoading(false);
    }
  };

  const signInWithLinkedIn = async () => {
    setLoading(true);
    try {
      const result = await nextAuthSignIn('linkedin', { redirect: false });
      if (result?.error) {
        return { success: false, error: result.error };
      }

      // Sync session after successful sign in
      const session = await getSession();
      if (session?.user) {
        const sessionUserId = (session.user as any).id;
        const fallbackId = crypto.randomUUID();
        console.log('🔍 [DEBUG] LinkedIn signIn user ID check:', {
          sessionUserId,
          fallbackId: fallbackId,
          usingFallback: !sessionUserId
        });

        const userData: User = {
          id: sessionUserId || fallbackId,
          email: session.user.email!,
          name: session.user.name || session.user.email?.split('@')[0] || 'User',
          avatar: session.user.image || undefined,
          userType: (session.user as any).user_type || 'creator',
          isVerified: (session.user as any).is_verified || true,
          phoneVerified: (session.user as any).phone_verified || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setUser(userData);
      }

      return { success: true };
    } catch (error) {
      console.error("LinkedIn sign in error:", error);
      return { success: false, error: "Failed to sign in with LinkedIn" };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user has valid ID
  const hasValidId = (userId: string | undefined): boolean => {
    if (!userId) return false;

    // Accept demo IDs and proper UUIDs (36 characters with hyphens)
    if (userId && (userId.startsWith("demo_") || userId.length === 36)) {
      return true;
    }

    return false;
  };



  return {
    user,
    isAuthenticated: isAuthenticated && hasValidId(user?.id),
    isLoading,
    signIn,
    signUp,
    signOut,
    verifyPhoneNumber,
    signInWithGoogle,
    signInWithLinkedIn,
    hasValidId,
  };
}
