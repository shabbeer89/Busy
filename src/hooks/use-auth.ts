"use client";

import { useAuthStore } from "@/stores/auth-store";
import { CreateUserData, User } from "@/types";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // For demo purposes, we'll use a simplified authentication
      // In production, this would integrate with NextAuth or Supabase Auth

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // First, logout any existing user to clear state
      logout();

      if (email && password) {
        // For demo, accept any email/password combination
        // In production, this would verify against Supabase Auth
        const userName = email.split("@")[0].split(".")[0].charAt(0).toUpperCase() + email.split("@")[0].split(".")[0].slice(1);
        const userType = email.includes("investor") || email.includes("arjun") || email.includes("suresh") || email.includes("ravi") ? "investor" : "creator";

        const user: User = {
          id: `demo_${Date.now()}`,
          email,
          name: userName,
          userType,
          isVerified: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setUser(user);
        return { success: true };
      } else {
        return { success: false, error: "Please enter email and password" };
      }

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

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user object (in production, this would integrate with Supabase Auth)
      const newUser: User = {
        id: `demo_${Date.now()}`,
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

      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any 6-digit OTP
      // In production, this would verify against Supabase stored OTP
      if (otp === "123456") {
        // If we have a user, update their phone verification status
        if (user) {
          setUser({
            ...user,
            phoneVerified: true,
            updatedAt: Date.now(),
          });
        }
        return { success: true };
      } else {
        return { success: false, error: "Invalid OTP. Please try again." };
      }

    } catch (error) {
      console.error("Phone verification error:", error);
      return { success: false, error: "Failed to verify phone. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    logout();
  };

  // Helper function to check if user has valid ID
  const hasValidId = (userId: string | undefined): boolean => {
    if (!userId) return false;

    // Accept demo IDs and OAuth-style IDs
    if (userId.startsWith("demo_") || userId.length >= 10) {
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
    hasValidId,
  };
}
