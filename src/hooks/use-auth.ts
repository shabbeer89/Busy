"use client";

import { useAuthStore } from "@/stores/auth-store";
import { CreateUserData, User } from "@/types";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "../../convex/_generated/dataModel";

// Helper function to properly convert string to Convex ID
const stringToConvexId = (id: string): Id<"users"> => {
  return id as Id<"users">;
};

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  // Convex mutations and queries
  const createUserMutation = useMutation(api.users.createUser);
  const verifyPhoneMutation = useMutation(api.users.verifyPhone);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // For demo purposes, match with seeded South Indian users
      // In production, this would integrate with your authentication service

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // First, logout any existing user to clear state
      logout();

      if (email && password) {
        // Check against seeded South Indian users
        // For demo, we'll match emails from our seeded data
        const seededEmails = [
          "arjun.iyer@email.com", "lakshmi.nair@email.com", "karthik.reddy@email.com",
          "priya.menon@email.com", "suresh.pillai@email.com", "kavitha.krishnan@email.com",
          "ravi.subramanian@email.com", "deepa.venkatesan@email.com", "mohan.ganesan@email.com",
          "anitha.balasubramanian@email.com", "vignesh.kumar@email.com", "meera.srinivasan@email.com"
        ];

        if (seededEmails.includes(email)) {
          try {
            // For demo purposes, check if user exists first
            // In a real app, this would verify credentials against stored hash
            const existingUser = await useQuery(api.users.getCurrentUser, { email });

            if (existingUser) {
              // User exists, create user object with existing Convex ID
              const user: User = {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name,
                userType: existingUser.userType,
                isVerified: existingUser.isVerified || true, // Seeded users are verified
                createdAt: existingUser.createdAt,
                updatedAt: existingUser.updatedAt,
              };

              setUser(user);
              return { success: true };
            } else {
              // For demo purposes, create the seeded user if they don't exist
              const userName = email.split("@")[0].split(".")[0].charAt(0).toUpperCase() + email.split("@")[0].split(".")[0].slice(1);
              const userType = email.includes("arjun") || email.includes("suresh") || email.includes("ravi") ||
                             email.includes("mohan") || email.includes("vignesh") ? "investor" : "creator";

              const newUserId = await createUserMutation({
                email: email,
                name: userName,
                userType: userType,
              });

              const user: User = {
                id: stringToConvexId(newUserId),
                email,
                name: userName,
                userType,
                isVerified: true, // Seeded users are verified
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };

              setUser(user);
              return { success: true };
            }

          } catch (error) {
            console.error("Error handling seeded user:", error);
            return { success: false, error: "Failed to authenticate user" };
          }
        } else {
          // For non-seeded emails, check if user exists first
          try {
            const existingUser = await useQuery(api.users.getCurrentUser, { email });

            if (existingUser) {
              // User exists, authenticate them (in production, verify password)
              const user: User = {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name,
                userType: existingUser.userType,
                isVerified: existingUser.isVerified || false,
                createdAt: existingUser.createdAt,
                updatedAt: existingUser.updatedAt,
              };

              setUser(user);
              return { success: true };
            } else {
              // User doesn't exist, show appropriate error
              return { success: false, error: "No account found with this email address. Please sign up first." };
            }
          } catch (error) {
            console.error("Error checking user:", error);
            return { success: false, error: "Failed to authenticate. Please try again." };
          }
        }
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

      try {
        // Create user in Convex DB
        const convexUserId = await createUserMutation({
          email: userData.email,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          userType: userData.userType,
          phoneVerified: false, // Will be verified via OTP
        });

        // Create user object with the actual Convex ID
        const convexUser: User = {
          id: stringToConvexId(convexUserId),
          email: userData.email,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          userType: userData.userType,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setUser(convexUser);
        return { success: true };

      } catch (convexError) {
        console.error("Convex user creation error:", convexError);
        return { success: false, error: "Failed to create user in database" };
      }

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

      // Verify OTP against stored value
      const { verifyOTP } = await import('@/lib/otp');
      const verificationResult = verifyOTP(phoneNumber, otp);

      if (!verificationResult.success) {
        return verificationResult;
      }

      // OTP is valid, mark phone as verified in database
      // For now, we'll just return success since we don't have a user ID yet
      // In a real implementation, you'd update the user's phone verification status
      try {
        // If we have a user, update their phone verification status
        if (user) {
          await verifyPhoneMutation({ userId: stringToConvexId(user.id) });

          // Update local user state to reflect phone verification
          setUser({
            ...user,
            phoneVerified: true,
            updatedAt: Date.now(),
          });
        }

        return { success: true };

      } catch (error) {
        console.error("Phone verification error:", error);
        return { success: false, error: "Failed to verify phone number" };
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

  // Helper function to check if user has valid Convex ID
  const hasValidConvexId = (userId: string | undefined): boolean => {
    if (!userId) return false;

    // Allow Convex IDs that start with "js"
    if (userId.startsWith("js") && userId.length > 20) {
      return true;
    }

    // Also allow OAuth-style IDs that look like long numbers (for OAuth users)
    if (userId.length >= 10 && /^\d+$/.test(userId)) {
      return true;
    }

    return false;
  };



  return {
    user,
    isAuthenticated: isAuthenticated && hasValidConvexId(user?.id),
    isLoading,
    signIn,
    signUp,
    signOut,
    verifyPhoneNumber,
    hasValidConvexId,
  };
}
