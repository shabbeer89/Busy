"use client";

import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Export individual functions for direct usage
export { api } from "../../convex/_generated/api";

// Re-export all Convex functions for easier imports
export {
  // User functions
  createUser,
  getCurrentUser,
  getUserById,
  updateUser,
  getAllUsers,
  verifyUser,
  getUsersByType,
  searchUsers,
} from "../../convex/users";

export {
  // Business idea functions
  createBusinessIdea,
  getBusinessIdea,
  getPublishedIdeas,
  getIdeasByCreator,
  getIdeasByCategory,
  updateBusinessIdea,
  deleteBusinessIdea,
  searchIdeas,
  getIdeasByFundingRange,
  getIdeasByStage,
} from "../../convex/businessIdeas";

export {
  // Investment offer functions
  createInvestmentOffer,
  getInvestmentOffer,
  getActiveOffers,
  getOffersByInvestor,
  updateInvestmentOffer,
  deleteInvestmentOffer,
  searchOffers,
  getOffersByAmountRange,
  getOffersByIndustries,
  getOffersByType,
  getOffersByStages,
} from "../../convex/investmentOffers";

export {
  // Match functions
  findMatchesForIdea,
  findMatchesForOffer,
  getMatch,
  getMatchesByIdea,
  getMatchesByInvestor,
  getMatchesByCreator,
  updateMatchStatus,
  getMatchesByStatus,
  getTopMatchesForIdea,
} from "../../convex/matches";

export {
  // Transaction functions
  createTransaction,
  getTransaction,
  getTransactionsByMatch,
  getTransactionsByInvestor,
  getTransactionsByCreator,
  updateTransactionStatus,
  getTransactionsByStatus,
  confirmCryptoTransaction,
  completeTransaction,
  getTransactionStats,
  getRecentTransactions,
} from "../../convex/transactions";

// Custom hooks for real-time subscriptions
export const useRealtimeSubscription = () => {
  // This would be implemented with Convex's real-time capabilities
  // For now, return a basic structure
  return {
    subscribe: (query: any) => {
      // Implementation would use Convex subscriptions
      return () => {}; // unsubscribe function
    },
  };
};

// Helper function to create optimistic updates
export const createOptimisticUpdate = <T>(
  currentData: T[],
  newItem: T,
  tempId?: string
): T[] => {
  return [...currentData, { ...newItem, _id: tempId || `temp_${Date.now()}` }];
};

// Helper function to handle real-time updates
export const handleRealtimeUpdate = <T>(
  currentData: T[],
  updatedItem: T,
  itemId: string
): T[] => {
  return currentData.map(item =>
    (item as any)._id === itemId ? updatedItem : item
  );
};