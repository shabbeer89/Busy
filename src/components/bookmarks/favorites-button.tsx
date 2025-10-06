"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToastFeedback } from "@/hooks/use-toast-feedback";
import { Heart } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";

interface FavoritesButtonProps {
  itemId: string;
  itemType: "offer" | "idea";
  className?: string;
}

interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: "offer" | "idea";
  createdAt: number;
}

export function FavoritesButton({ itemId, itemType, className }: FavoritesButtonProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastFeedback();

  // Convex queries and mutations
  const isFavoritedQuery = useQuery(
    api.favorites.isFavorited,
    user ? { itemId, itemType } : "skip"
  );
  const addToFavoritesMutation = useMutation(api.favorites.addToFavorites);
  const removeFromFavoritesMutation = useMutation(api.favorites.removeFromFavorites);

  const isFavorited = isFavoritedQuery ?? false;
  const isLoading = addToFavoritesMutation === undefined || removeFromFavoritesMutation === undefined;

  const toggleFavorite = async () => {
    if (!user) {
      showError("Please sign in to save favorites");
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        await removeFromFavoritesMutation({ itemId, itemType });
        showSuccess("Removed from favorites");
      } else {
        // Add to favorites
        await addToFavoritesMutation({ itemId, itemType });
        showSuccess("Added to favorites");
      }
    } catch (error) {
      showError("Failed to update favorites");
    }
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" className={className} disabled>
        <Heart className="w-4 h-4 mr-2" />
        Sign in to save
      </Button>
    );
  }

  return (
    <Button
      variant={isFavorited ? "default" : "outline"}
      size="sm"
      onClick={toggleFavorite}
      disabled={isLoading}
      className={className}
    >
      <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
      {isFavorited ? "Saved" : "Save"}
    </Button>
  );
}

// Hook for managing favorites
export function useFavorites() {
  const { user } = useAuth();

  // Convex queries
  const favorites = useQuery(
    api.favorites.getUserFavorites,
    user ? "skip" : "skip" // This query doesn't take args, it uses auth
  ) || [];

  const favoritedOffers = useQuery(
    api.favorites.getFavoritedOffers,
    user ? "skip" : "skip"
  ) || [];

  const favoritedIdeas = useQuery(
    api.favorites.getFavoritedIdeas,
    user ? "skip" : "skip"
  ) || [];

  // Mutations
  const addToFavoritesMutation = useMutation(api.favorites.addToFavorites);
  const removeFromFavoritesMutation = useMutation(api.favorites.removeFromFavorites);

  const isLoading = favorites === undefined || favoritedOffers === undefined || favoritedIdeas === undefined;

  const addToFavorites = async (itemId: string, itemType: "offer" | "idea") => {
    if (!user) throw new Error("User not authenticated");

    try {
      await addToFavoritesMutation({ itemId, itemType });
    } catch (error) {
      throw new Error("Failed to add to favorites");
    }
  };

  const removeFromFavorites = async (itemId: string, itemType: "offer" | "idea") => {
    if (!user) throw new Error("User not authenticated");

    try {
      await removeFromFavoritesMutation({ itemId, itemType });
    } catch (error) {
      throw new Error("Failed to remove from favorites");
    }
  };

  const isFavorite = (itemId: string, itemType: "offer" | "idea") => {
    return favorites.some(fav => fav.itemId === itemId && fav.itemType === itemType);
  };

  const getFavoritesByType = (itemType: "offer" | "idea") => {
    return favorites.filter(fav => fav.itemType === itemType);
  };

  return {
    favorites,
    favoritedOffers,
    favoritedIdeas,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByType,
  };
}