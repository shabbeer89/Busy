"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase'

export interface SearchFilters {
  query: string
  category: string[]
  fundingRange: {
    min: number
    max: number
  }
  stage: string[]
  location: string
  tags: string[]
  sortBy: 'relevance' | 'recent' | 'funding' | 'popular'
  verifiedOnly: boolean
}

export interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  fundingGoal: number
  equityOffered: number
  stage: string
  location?: string
  isVerified: boolean
  creatorName: string
  createdAt: string
  relevanceScore: number
  matchScore?: number
}

interface UseAdvancedSearchProps {
  enabled?: boolean
  debounceMs?: number
}

export function useAdvancedSearch({
  enabled = true,
  debounceMs = 300
}: UseAdvancedSearchProps = {}) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    fundingRange: { min: 0, max: 10000000 },
    stage: [],
    location: '',
    tags: [],
    sortBy: 'relevance',
    verifiedOnly: false
  })

  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search query
  useEffect(() => {
    if (!enabled) return

    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query)
      setIsSearching(false)
    }, debounceMs)

    setIsSearching(true)
    return () => clearTimeout(timer)
  }, [filters.query, debounceMs, enabled])

  // State for business ideas from Supabase
  const [rawIdeas, setRawIdeas] = useState<any[]>([])
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true)
  const supabase = createClient()

  // Fetch business ideas from Supabase
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('business_ideas')
          .select('*')
          .eq('status', 'published')

        if (error) throw error

        if (data) {
          setRawIdeas(data)
        }
      } catch (error) {
        console.error('Error fetching business ideas:', error)
      } finally {
        setIsLoadingIdeas(false)
      }
    }

    if (enabled) {
      fetchIdeas()
    }
  }, [supabase, enabled])

  // Calculate relevance score for an idea
  const calculateRelevanceScore = useCallback((idea: any, searchFilters: SearchFilters): number => {
    let score = 0

    // Query relevance (40% weight)
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase()
      const titleMatch = idea.title.toLowerCase().includes(query) ? 0.4 : 0
      const descMatch = idea.description.toLowerCase().includes(query) ? 0.3 : 0
      const tagMatch = idea.tags?.some((tag: string) => tag.toLowerCase().includes(query)) ? 0.2 : 0
      score += Math.max(titleMatch, descMatch, tagMatch)
    } else {
      score += 0.4 // Base score when no query
    }

    // Category relevance (20% weight)
    if (searchFilters.category.length > 0) {
      const categoryMatch = searchFilters.category.includes(idea.category) ? 0.2 : 0
      score += categoryMatch
    } else {
      score += 0.2 // Base score when no category filter
    }

    // Funding range relevance (15% weight)
    if (idea.fundingGoal >= searchFilters.fundingRange.min &&
        idea.fundingGoal <= searchFilters.fundingRange.max) {
      score += 0.15
    } else if (idea.fundingGoal < searchFilters.fundingRange.min) {
      // Penalty for being too small
      score += 0.05
    } else {
      // Penalty for being too large
      score += 0.02
    }

    // Stage relevance (10% weight)
    if (searchFilters.stage.length > 0) {
      const stageMatch = searchFilters.stage.includes(idea.stage) ? 0.1 : 0
      score += stageMatch
    } else {
      score += 0.1 // Base score when no stage filter
    }

    // Verification bonus (5% weight)
    if (searchFilters.verifiedOnly && idea.creatorVerified) {
      score += 0.05
    } else if (!searchFilters.verifiedOnly) {
      score += 0.05 // Base score when not filtering by verification
    }

    // Location relevance (5% weight)
    if (searchFilters.location) {
      const locationMatch = idea.creatorLocation?.toLowerCase().includes(searchFilters.location.toLowerCase()) ? 0.05 : 0
      score += locationMatch
    } else {
      score += 0.05 // Base score when no location filter
    }

    // Tag relevance (5% weight)
    if (searchFilters.tags.length > 0) {
      const tagMatches = searchFilters.tags.filter(tag =>
        idea.tags?.some((ideaTag: string) => ideaTag.toLowerCase().includes(tag.toLowerCase()))
      ).length
      score += (tagMatches / searchFilters.tags.length) * 0.05
    } else {
      score += 0.05 // Base score when no tag filter
    }

    return Math.min(1.0, Math.max(0.0, score))
  }, [])

  // Convert Supabase data to SearchResult format
  const allResults: SearchResult[] = useMemo(() => {
    if (!rawIdeas.length) return []

    return rawIdeas.map((idea: any) => ({
      id: idea.id,
      title: idea.title,
      description: idea.description,
      category: idea.category,
      tags: idea.tags || [],
      fundingGoal: idea.funding_goal,
      equityOffered: idea.equity_offered,
      stage: idea.stage,
      location: '', // Not available in current schema
      isVerified: false, // Not available in current schema
      creatorName: 'Anonymous', // Not available in current schema
      createdAt: idea.created_at || new Date().toISOString(),
      relevanceScore: calculateRelevanceScore(idea, filters)
    }))
  }, [rawIdeas, filters, calculateRelevanceScore])

  // Filter and sort results
  const filteredResults = useMemo(() => {
    if (!enabled) return []

    let filtered = allResults.filter(idea => {
      // Apply all filters
      if (filters.category.length > 0 && !filters.category.includes(idea.category)) {
        return false
      }

      if (idea.fundingGoal < filters.fundingRange.min || idea.fundingGoal > filters.fundingRange.max) {
        return false
      }

      if (filters.stage.length > 0 && !filters.stage.includes(idea.stage)) {
        return false
      }

      if (filters.verifiedOnly && !idea.isVerified) {
        return false
      }

      if (filters.location && !idea.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          idea.tags.some((ideaTag: string) =>
            ideaTag.toLowerCase().includes(filterTag.toLowerCase())
          )
        )
        if (!hasMatchingTag) return false
      }

      return true
    })

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'funding':
          return b.fundingGoal - a.fundingGoal
        case 'popular':
          // Sort by verification status and creation date as proxy for popularity
          if (a.isVerified !== b.isVerified) {
            return a.isVerified ? -1 : 1
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [allResults, filters, enabled])

  // Search statistics
  const searchStats = useMemo(() => {
    const totalResults = filteredResults.length
    const avgRelevance = totalResults > 0
      ? filteredResults.reduce((sum, result) => sum + result.relevanceScore, 0) / totalResults
      : 0

    const categoryDistribution = filteredResults.reduce((acc, result) => {
      acc[result.category] = (acc[result.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.entries(categoryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)

    return {
      totalResults,
      avgRelevance,
      topCategories,
      hasFilters: Object.values(filters).some(value =>
        Array.isArray(value) ? value.length > 0 : Boolean(value)
      )
    }
  }, [filteredResults, filters])

  // Saved searches functionality
  const [savedSearches, setSavedSearches] = useState<Array<{
    id: string
    name: string
    filters: SearchFilters
    createdAt: string
  }>>([])

  const saveSearch = useCallback((name: string) => {
    const newSavedSearch = {
      id: `search_${Date.now()}`,
      name,
      filters,
      createdAt: new Date().toISOString()
    }

    setSavedSearches(prev => [newSavedSearch, ...prev.slice(0, 9)]) // Keep only 10 recent searches
  }, [filters])

  const loadSavedSearch = useCallback((savedSearch: typeof savedSearches[0]) => {
    setFilters(savedSearch.filters)
  }, [])

  const deleteSavedSearch = useCallback((searchId: string) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId))
  }, [])

  return {
    // Search state
    filters,
    setFilters,
    isSearching,

    // Results
    results: filteredResults,
    allResults,

    // Statistics
    searchStats,

    // Saved searches
    savedSearches,
    saveSearch,
    loadSavedSearch,
    deleteSavedSearch,

    // Utility functions
    clearFilters: () => setFilters({
      query: '',
      category: [],
      fundingRange: { min: 0, max: 10000000 },
      stage: [],
      location: '',
      tags: [],
      sortBy: 'relevance',
      verifiedOnly: false
    }),

    // Loading states
    isLoading: !rawIdeas || rawIdeas.length === 0
  }
}
