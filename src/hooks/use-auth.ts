"use client";

import { useAuthStore } from "@/stores/auth-store";
import { CreateUserData, User } from "@/types";
import { useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "../../convex/_generated/dataModel";

// Helper function to properly convert string to Convex ID
const stringToConvexId = (id: string): Id<"users"> => {
  return id as Id<"users">;
};

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  // Convex mutations
  const createUserMutation = useMutation(api.users.createUser);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // For demo purposes, match with seeded South Indian users
      // In production, this would integrate with your authentication service

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // First, logout any existing user to clear fake IDs
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
            // For demo purposes, we'll create/find the user properly
            // In a real app, this would use proper authentication

            // Create user data for seeded user
            const userName = email.split("@")[0].split(".")[0].charAt(0).toUpperCase() + email.split("@")[0].split(".")[0].slice(1);
            const userType = email.includes("arjun") || email.includes("suresh") || email.includes("ravi") ||
                           email.includes("mohan") || email.includes("vignesh") ? "investor" : "creator";

            // First, check if user already exists by trying to create them
            // The createUser mutation will throw an error if email already exists
            let newUserId;
            try {
              newUserId = await createUserMutation({
                email: email,
                name: userName,
                userType: userType,
              });
            } catch (createError: any) {
              if (createError.message?.includes("already exists")) {
                // User already exists, that's fine for demo
                // For demo purposes, we'll create a new user with a different email format
                const demoEmail = `${email}.demo`;
                newUserId = await createUserMutation({
                  email: demoEmail,
                  name: userName,
                  userType: userType,
                });
              } else {
                throw createError;
              }
            }

            // Create user object with real Convex ID
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

          } catch (error) {
            console.error("Error handling seeded user:", error);
            return { success: false, error: "Failed to authenticate user" };
          }
        } else {
          // For non-seeded emails, create user in database first
          try {
            const newUserId = await createUserMutation({
              email: email,
              name: email.split("@")[0],
              userType: "creator",
            });

            const user: User = {
              id: stringToConvexId(newUserId),
              email,
              name: email.split("@")[0],
              userType: "creator",
              isVerified: false,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            setUser(user);
            return { success: true };
          } catch (error) {
            return { success: false, error: "Failed to create user" };
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
          userType: userData.userType,
        });

        // Create user object with the actual Convex ID
        const convexUser: User = {
          id: stringToConvexId(convexUserId),
          email: userData.email,
          name: userData.name,
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

  const signOut = () => {
    logout();
  };

  // Helper function to check if user has valid Convex ID
  const hasValidConvexId = (userId: string | undefined): boolean => {
    // Convex IDs are typically longer than simple strings and don't contain "demo", "temp", or "real_"
    return userId ? userId.length > 20 && !userId.includes("demo") && !userId.includes("temp") && !userId.includes("real_") : false;
  };

  return {
    user,
    isAuthenticated: isAuthenticated && hasValidConvexId(user?.id),
    isLoading,
    signIn,
    signUp,
    signOut,
    hasValidConvexId,
  };
}