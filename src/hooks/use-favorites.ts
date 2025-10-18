"use client"

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

interface UseFavoritesProps {
  itemType?: 'offer' | 'idea'
  autoRefresh?: boolean
}

export function useFavorites({
  itemType,
  autoRefresh = true
}: UseFavoritesProps = {}) {
  const { user } = useAuth()
  const [favoritesMap, setFavoritesMap] = useState<Map<string, boolean>>(new Map())
  const [favorites, setFavorites] = useState<any[]>([])
  const [favoritedOffers, setFavoritedOffers] = useState<any[]>([])
  const [favoritedIdeas, setFavoritedIdeas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch favorites from Supabase
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([])
        setFavoritedOffers([])
        setFavoritedIdeas([])
        setFavoritesMap(new Map())
        setIsLoading(false)
        return
      }

      try {
        // Get all user favorites
        const { data: favoritesData, error: favoritesError } = await (supabase as any)
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)

        if (favoritesError) throw favoritesError

        if (favoritesData) {
          setFavorites(favoritesData)

          // Build favorites map
          const map = new Map<string, boolean>()
          favoritesData.forEach((favorite: any) => {
            map.set(`${favorite.item_type}_${favorite.item_id}`, true)
          })
          setFavoritesMap(map)

          // Get favorited offers with offer details
          const offerIds = favoritesData
            .filter((fav: any) => fav.item_type === 'offer')
            .map((fav: any) => fav.item_id)

          if (offerIds.length > 0) {
            const { data: offersData, error: offersError } = await (supabase as any)
              .from('investment_offers')
              .select('*')
              .in('id', offerIds)

            if (offersError) throw offersError
            setFavoritedOffers(offersData || [])
          } else {
            setFavoritedOffers([])
          }

          // Get favorited ideas with idea details
          const ideaIds = favoritesData
            .filter((fav: any) => fav.item_type === 'idea')
            .map((fav: any) => fav.item_id)

          if (ideaIds.length > 0) {
            const { data: ideasData, error: ideasError } = await (supabase as any)
              .from('business_ideas')
              .select('*')
              .in('id', ideaIds)

            if (ideasError) throw ideasError
            setFavoritedIdeas(ideasData || [])
          } else {
            setFavoritedIdeas([])
          }
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [user, supabase])

  // Check if specific item is favorited
  const isItemFavorited = useCallback((itemId: string, type?: 'offer' | 'idea') => {
    if (!user) return false

    if (type) {
      return favoritesMap.get(`${type}_${itemId}`) || false
    }

    // Check both types if no specific type provided
    return favoritesMap.get(`offer_${itemId}`) || favoritesMap.get(`idea_${itemId}`) || false
  }, [user, favoritesMap])

  // Toggle favorite status for an item
  const toggleFavorite = useCallback(async (itemId: string, type: 'offer' | 'idea') => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const isCurrentlyFavorited = isItemFavorited(itemId, type)

      if (isCurrentlyFavorited) {
        // Remove from favorites
        const { error } = await (supabase as any)
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('item_type', type)

        if (error) throw error

        setFavoritesMap(prev => {
          const newMap = new Map(prev)
          newMap.delete(`${type}_${itemId}`)
          return newMap
        })

        // Refresh favorites data
        const { data: updatedFavorites } = await (supabase as any)
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)

        if (updatedFavorites) {
          setFavorites(updatedFavorites)
        }

        return { success: true, action: 'removed' }
      } else {
        // Add to favorites
        const { error } = await (supabase as any)
          .from('favorites')
          .insert([
            {
              user_id: user.id,
              item_id: itemId,
              item_type: type,
            }
          ])

        if (error) throw error

        setFavoritesMap(prev => {
          const newMap = new Map(prev)
          newMap.set(`${type}_${itemId}`, true)
          return newMap
        })

        // Refresh favorites data
        const { data: updatedFavorites } = await (supabase as any)
          .from('favorites')
          .select('*')
          .eq('user_id', user.id)

        if (updatedFavorites) {
          setFavorites(updatedFavorites)
        }

        return { success: true, action: 'added' }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }, [user, supabase, isItemFavorited])

  // Get filtered favorites based on type
  const getFilteredFavorites = useCallback(() => {
    if (!itemType) return []

    if (itemType === 'offer') {
      return favoritedOffers
    }

    if (itemType === 'idea') {
      return favoritedIdeas
    }

    return []
  }, [itemType, favoritedOffers, favoritedIdeas])

  return {
    favorites,
    favoritedOffers,
    favoritedIdeas,
    filteredFavorites: getFilteredFavorites(),
    isItemFavorited,
    toggleFavorite,
    isLoading,
  }
}
