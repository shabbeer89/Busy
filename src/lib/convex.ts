"use client";

import { ConvexReactClient } from "convex/react";

export const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Export the generated API client for use in components
export { api } from "../../convex/_generated/api";

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