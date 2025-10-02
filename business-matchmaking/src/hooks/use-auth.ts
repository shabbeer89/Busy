"use client";

import { useAuthStore } from "@/stores/auth-store";
import { CreateUserData, User } from "@/types";

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout } = useAuthStore();

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);

    try {
      // For demo purposes, simulate authentication
      // In production, this would integrate with your authentication service

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo: create a mock user if credentials are provided
      if (email && password) {
        const mockUser: User = {
          id: "demo-user-id",
          email,
          name: email.split("@")[0],
          userType: "creator",
          isVerified: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setUser(mockUser);
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
      // For demo purposes, simulate user creation
      // In production, this would create the user in your database

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userData.email && userData.name && userData.password) {
        const mockUser: User = {
          id: "demo-user-id",
          email: userData.email,
          name: userData.name,
          userType: userData.userType,
          isVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        setUser(mockUser);
        return { success: true };
      } else {
        return { success: false, error: "Please fill in all required fields" };
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

  return {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}