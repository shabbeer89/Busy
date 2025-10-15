"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToastFeedback } from "@/hooks/use-toast-feedback";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase";

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
  const supabase = createClient();

  // Check if item is favorited
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await (supabase as any)
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', itemType)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking favorite status:', error);
          return;
        }

        setIsFavorited(!!data);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [user, itemId, itemType, supabase]);

  const toggleFavorite = async () => {
    if (!user) {
      showError("Please sign in to save favorites");
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await (supabase as any)
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', itemType);

        if (error) throw error;
        setIsFavorited(false);
        showSuccess("Removed from favorites");
      } else {
        // Add to favorites
        const { error } = await (supabase as any)
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              item_id: itemId,
              item_type: itemType,
            }
          ]);

        if (error) throw error;
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
  const [favorites, setFavorites] = useState<any[]>([]);
  const [favoritedOffers, setFavoritedOffers] = useState<any[]>([]);
  const [favoritedIdeas, setFavoritedIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Fetch favorites from Supabase
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        setFavoritedOffers([]);
        setFavoritedIdeas([]);
        setIsLoading(false);
        return;
      }

      try {
        // Get all user favorites
        const { data: favoritesData, error: favoritesError } = await (supabase as any)
          .from('favorites')
          .select('*')
          .eq('user_id', user.id);

        if (favoritesError) throw favoritesError;

        if (favoritesData) {
          setFavorites(favoritesData);

          // Get favorited offers with offer details
          const offerIds = favoritesData
            .filter((fav: any) => fav.item_type === 'offer')
            .map((fav: any) => fav.item_id);

          if (offerIds.length > 0) {
            const { data: offersData, error: offersError } = await (supabase as any)
              .from('investment_offers')
              .select('*')
              .in('id', offerIds);

            if (offersError) throw offersError;

            // Transform offers data to include favorited date
            const offersWithFavoriteDate = offersData.map((offer: any) => {
              const favorite = favoritesData.find((fav: any) => fav.item_id === offer.id && fav.item_type === 'offer');
              return {
                ...offer,
                favoritedAt: favorite ? new Date(favorite.created_at).getTime() : Date.now(),
              };
            });

            setFavoritedOffers(offersWithFavoriteDate || []);
          } else {
            setFavoritedOffers([]);
          }

          // Get favorited ideas with idea details
          const ideaIds = favoritesData
            .filter((fav: any) => fav.item_type === 'idea')
            .map((fav: any) => fav.item_id);

          if (ideaIds.length > 0) {
            const { data: ideasData, error: ideasError } = await (supabase as any)
              .from('business_ideas')
              .select('*')
              .in('id', ideaIds);

            if (ideasError) throw ideasError;

            // Transform ideas data to include favorited date
            const ideasWithFavoriteDate = ideasData.map((idea: any) => {
              const favorite = favoritesData.find((fav: any) => fav.item_id === idea.id && fav.item_type === 'idea');
              return {
                ...idea,
                favoritedAt: favorite ? new Date(favorite.created_at).getTime() : Date.now(),
              };
            });

            setFavoritedIdeas(ideasWithFavoriteDate || []);
          } else {
            setFavoritedIdeas([]);
          }
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [user, supabase]);

  const addToFavorites = async (itemId: string, itemType: "offer" | "idea") => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { error } = await (supabase as any)
        .from('favorites')
        .insert([
          {
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
          }
        ]);

      if (error) throw error;

      // Refresh favorites
      const { data: updatedFavorites } = await (supabase as any)
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (updatedFavorites) {
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      throw new Error("Failed to add to favorites");
    }
  };

  const removeFromFavorites = async (itemId: string, itemType: "offer" | "idea") => {
    if (!user) throw new Error("User not authenticated");

    try {
      const { error } = await (supabase as any)
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (error) throw error;

      // Refresh favorites
      const { data: updatedFavorites } = await (supabase as any)
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (updatedFavorites) {
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      throw new Error("Failed to remove from favorites");
    }
  };

  const isFavorite = (itemId: string, itemType: "offer" | "idea") => {
    return favorites.some((fav: any) => fav.item_id === itemId && fav.item_type === itemType);
  };

  const getFavoritesByType = (itemType: "offer" | "idea") => {
    return favorites.filter((fav: any) => fav.item_type === itemType);
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
