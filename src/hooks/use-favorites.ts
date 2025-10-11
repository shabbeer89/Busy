"use client"

import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@/lib/convex'
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

  // Convex mutations
  const addToFavorites = useMutation(api.favorites.addToFavorites)
  const removeFromFavorites = useMutation(api.favorites.removeFromFavorites)

  // Convex queries
  const userFavorites = useQuery(api.favorites.getUserFavorites)
  const favoritedOffers = useQuery(api.favorites.getFavoritedOffers)
  const favoritedIdeas = useQuery(api.favorites.getFavoritedIdeas)

  // Check if specific item is favorited
  const isItemFavorited = useCallback((itemId: string, type?: 'offer' | 'idea') => {
    if (!user || !userFavorites) return false

    if (type) {
      return favoritesMap.get(`${type}_${itemId}`) || false
    }

    // Check both types if no specific type provided
    return favoritesMap.get(`offer_${itemId}`) || favoritesMap.get(`idea_${itemId}`) || false
  }, [user, userFavorites, favoritesMap])

  // Toggle favorite status for an item
  const toggleFavorite = useCallback(async (itemId: string, type: 'offer' | 'idea') => {
    if (!user) return { success: false, error: 'User not authenticated' }

    try {
      const isCurrentlyFavorited = isItemFavorited(itemId, type)

      if (isCurrentlyFavorited) {
        await removeFromFavorites({ itemId, itemType: type })
        setFavoritesMap(prev => {
          const newMap = new Map(prev)
          newMap.delete(`${type}_${itemId}`)
          return newMap
        })
        return { success: true, action: 'removed' }
      } else {
        await addToFavorites({ itemId, itemType: type })
        setFavoritesMap(prev => {
          const newMap = new Map(prev)
          newMap.set(`${type}_${itemId}`, true)
          return newMap
        })
        return { success: true, action: 'added' }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }, [user, addToFavorites, removeFromFavorites, isItemFavorited])

  // Build favorites map from query results
  useEffect(() => {
    if (userFavorites) {
      const map = new Map<string, boolean>()
      userFavorites.forEach(favorite => {
        map.set(`${favorite.itemType}_${favorite.itemId}`, true)
      })
      setFavoritesMap(map)
    }
  }, [userFavorites])

  // Get filtered favorites based on type
  const getFilteredFavorites = useCallback(() => {
    if (!itemType) return []

    if (itemType === 'offer' && favoritedOffers) {
      return favoritedOffers
    }

    if (itemType === 'idea' && favoritedIdeas) {
      return favoritedIdeas
    }

    return []
  }, [itemType, favoritedOffers, favoritedIdeas])

  return {
    favorites: userFavorites || [],
    favoritedOffers: favoritedOffers || [],
    favoritedIdeas: favoritedIdeas || [],
    filteredFavorites: getFilteredFavorites(),
    isItemFavorited,
    toggleFavorite,
    isLoading: !userFavorites || !favoritedOffers || !favoritedIdeas,
  }
}