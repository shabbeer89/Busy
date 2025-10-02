"use client";

import { useState } from "react";
import { useAuth } from "./use-auth";
import { UpdateUserData, User } from "@/types";

export function useProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (data: UpdateUserData): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsLoading(true);

    try {
      // For demo purposes, simulate profile update
      // In production, this would update the user in the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real implementation, you would:
      // 1. Update the user in the database
      // 2. Refresh the user state
      // 3. Handle any errors

      return { success: true };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error: "Failed to update profile" };
    } finally {
      setIsLoading(false);
    }
  };

  const getProfileCompletionStatus = (user: User) => {
    const fields = {
      basic: {
        name: !!user.name,
        email: !!user.email,
        location: !!user.location,
        bio: !!user.bio,
      },
      social: {
        linkedin: !!user.socialLinks?.linkedin,
        twitter: !!user.socialLinks?.twitter,
      },
      creator: user.userType === "creator" ? {
        companyName: !!user.companyName,
        industry: !!user.industry,
        experience: !!user.experience,
      } : null,
      investor: user.userType === "investor" ? {
        investmentRange: !!(user.investmentRange?.min && user.investmentRange?.max),
        riskTolerance: !!user.riskTolerance,
        preferredIndustries: !!(user.preferredIndustries && user.preferredIndustries.length > 0),
      } : null,
    };

    const completedFields = Object.values(fields.basic).filter(Boolean).length;
    const totalBasicFields = Object.keys(fields.basic).length;

    let roleFields = 0;
    let totalRoleFields = 0;

    if (fields.creator && user.userType === "creator") {
      roleFields = Object.values(fields.creator).filter(Boolean).length;
      totalRoleFields = Object.keys(fields.creator).length;
    }

    if (fields.investor && user.userType === "investor") {
      roleFields = Object.values(fields.investor).filter(Boolean).length;
      totalRoleFields = Object.keys(fields.investor).length;
    }

    const totalFields = totalBasicFields + totalRoleFields;
    const completedTotalFields = completedFields + roleFields;

    return {
      percentage: Math.round((completedTotalFields / totalFields) * 100),
      completedFields: completedTotalFields,
      totalFields,
      isComplete: completedTotalFields === totalFields,
      sections: {
        basic: {
          completed: completedFields,
          total: totalBasicFields,
          percentage: Math.round((completedFields / totalBasicFields) * 100),
        },
        role: {
          completed: roleFields,
          total: totalRoleFields,
          percentage: totalRoleFields > 0 ? Math.round((roleFields / totalRoleFields) * 100) : 100,
        },
      },
    };
  };

  const profileStatus = user ? getProfileCompletionStatus(user) : null;

  return {
    user,
    isLoading,
    updateProfile,
    profileStatus,
  };
}