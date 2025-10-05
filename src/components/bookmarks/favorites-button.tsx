"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToastFeedback } from "@/hooks/use-toast-feedback";
import { Heart } from "lucide-react";

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
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if item is already favorited
    checkFavoriteStatus();
  }, [itemId, itemType, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    try {
      // In a real app, this would query Convex
      // For now, simulate checking localStorage or state
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || "[]");
      const isFav = favorites.some((fav: FavoriteItem) =>
        fav.itemId === itemId && fav.itemType === itemType
      );
      setIsFavorited(isFav);
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      showError("Please sign in to save favorites");
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would call Convex mutations
      const favorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || "[]");

      if (isFavorited) {
        // Remove from favorites
        const updatedFavorites = favorites.filter((fav: FavoriteItem) =>
          !(fav.itemId === itemId && fav.itemType === itemType)
        );
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
        setIsFavorited(false);
        showSuccess("Removed from favorites");
      } else {
        // Add to favorites
        const newFavorite: FavoriteItem = {
          id: `fav_${Date.now()}`,
          userId: user.id,
          itemId,
          itemType,
          createdAt: Date.now(),
        };
        favorites.push(newFavorite);
        localStorage.setItem(`favorites_${user.id}`, JSON.stringify(favorites));
        setIsFavorited(true);
        showSuccess("Added to favorites");
      }
    } catch (error) {
      showError("Failed to update favorites");
    } finally {
      setIsLoading(false);
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
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // In a real app, this would query Convex
      const storedFavorites = JSON.parse(localStorage.getItem(`favorites_${user.id}`) || "[]");
      setFavorites(storedFavorites);
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (itemId: string, itemType: "offer" | "idea") => {
    if (!user) throw new Error("User not authenticated");

    try {
      const newFavorite: FavoriteItem = {
        id: `fav_${Date.now()}`,
        userId: user.id,
        itemId,
        itemType,
        createdAt: Date.now(),
      };

      const updatedFavorites = [...favorites, newFavorite];
      setFavorites(updatedFavorites);
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));

      return newFavorite;
    } catch (error) {
      throw new Error("Failed to add to favorites");
    }
  };

  const removeFromFavorites = async (itemId: string, itemType: "offer" | "idea") => {
    if (!user) throw new Error("User not authenticated");

    try {
      const updatedFavorites = favorites.filter(fav =>
        !(fav.itemId === itemId && fav.itemType === itemType)
      );
      setFavorites(updatedFavorites);
      localStorage.setItem(`favorites_${user.id}`, JSON.stringify(updatedFavorites));
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
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoritesByType,
    refreshFavorites: loadFavorites,
  };
}