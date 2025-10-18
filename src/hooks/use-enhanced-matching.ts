"use client"

import { useState, useEffect, useCallback } from 'react'
import { matchingEngine, type MatchResult, type UserProfile, type BusinessIdea, type InvestmentOffer } from '@/lib/matching-algorithm'
import { createClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/use-auth'

interface UseEnhancedMatchingProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useEnhancedMatching({
  autoRefresh = true,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
}: UseEnhancedMatchingProps = {}) {
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const { user } = useAuth()
  const supabase = createClient()

  // Load user profiles, ideas, and offers into the matching engine
  const loadDataIntoEngine = useCallback(async () => {
    if (!user) return

    try {
      // Load all user profiles
      const { data: profiles, error: profilesError } = await (supabase as any)
        .from('users')
        .select('*')

      if (profilesError) throw profilesError

      // Load published business ideas
      const { data: ideas, error: ideasError } = await (supabase as any)
        .from('business_ideas')
        .select('*')
        .eq('status', 'published')

      if (ideasError) throw ideasError

      // Load active investment offers
      const { data: offers, error: offersError } = await (supabase as any)
        .from('investment_offers')
        .select('*')
        .eq('is_active', true)

      if (offersError) throw offersError

      // Load data into matching engine
      if (profiles) await matchingEngine.loadUserProfiles(profiles)
      if (ideas) await matchingEngine.loadBusinessIdeas(ideas)
      if (offers) await matchingEngine.loadInvestmentOffers(offers)

    } catch (err) {
      console.error('Error loading data into matching engine:', err)
      setError('Failed to load matching data')
    }
  }, [user, supabase])

  // Find matches for current user
  const findMatches = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      await loadDataIntoEngine()
      const newMatches = await matchingEngine.findMatches(user.id, user.userType, 20)
      setMatches(newMatches)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error finding matches:', err)
      setError('Failed to find matches')
    } finally {
      setIsLoading(false)
    }
  }, [user, loadDataIntoEngine])

  // Get match statistics
  const getMatchStatistics = useCallback(async () => {
    if (!user) return null

    try {
      return await matchingEngine.getMatchStatistics(user.id, user.userType)
    } catch (err) {
      console.error('Error getting match statistics:', err)
      return null
    }
  }, [user])

  // Update user profile in matching engine (for real-time profile updates)
  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>) => {
    if (!user) return

    try {
      // Update in database first
      const { error } = await (supabase as any)
        .from('users')
        .update(updatedProfile)
        .eq('id', user.id)

      if (error) throw error

      // Reload data and refresh matches
      await loadDataIntoEngine()
      await findMatches()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    }
  }, [user, supabase, loadDataIntoEngine, findMatches])

  // Set up real-time subscriptions for data changes
  useEffect(() => {
    if (!user || !autoRefresh) return

    // Initial load
    findMatches()

    // Set up subscriptions for real-time updates
    const subscriptions = [
      // Subscribe to business ideas changes
      supabase
        .channel('business_ideas_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_ideas',
          },
          () => {
            // Refresh matches when ideas change
            setTimeout(() => findMatches(), 1000)
          }
        )
        .subscribe(),

      // Subscribe to investment offers changes
      supabase
        .channel('investment_offers_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'investment_offers',
          },
          () => {
            // Refresh matches when offers change
            setTimeout(() => findMatches(), 1000)
          }
        )
        .subscribe(),

      // Subscribe to user profile changes
      supabase
        .channel('user_profiles_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'users',
          },
          () => {
            // Refresh matches when profiles change
            setTimeout(() => findMatches(), 1000)
          }
        )
        .subscribe(),
    ]

    // Set up periodic refresh
    const refreshIntervalId = setInterval(() => {
      findMatches()
    }, refreshInterval)

    // Cleanup function
    return () => {
      subscriptions.forEach(sub => sub.unsubscribe())
      clearInterval(refreshIntervalId)
    }
  }, [user, autoRefresh, refreshInterval, supabase, findMatches])

  // Manual refresh function
  const refreshMatches = useCallback(() => {
    return findMatches()
  }, [findMatches])

  return {
    matches,
    isLoading,
    error,
    lastUpdated,
    findMatches: refreshMatches,
    updateProfile,
    getMatchStatistics,
  }
}
