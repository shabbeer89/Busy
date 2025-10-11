"use client"

import { useState, useEffect } from 'react'

export interface AIRecommendation {
  type: 'idea' | 'investor' | 'match' | 'content'
  id: string
  title: string
  description: string
  confidence: number
  reason: string
  tags: string[]
  metadata?: {
    funding_goal?: number
    stage?: string
    category?: string
    amount_range?: { min: number; max: number }
  }
}

export function useAIRecommendations(userId?: string, userType?: 'creator' | 'investor') {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock AI recommendations data
  const mockRecommendations: AIRecommendation[] = [
    {
      type: 'idea',
      id: 'ai-rec-1',
      title: 'AI-Powered Healthcare Platform',
      description: 'Revolutionary healthcare platform using AI for early disease detection and personalized treatment recommendations.',
      confidence: 0.95,
      reason: 'High-growth sector with strong market potential and AI integration',
      tags: ['AI', 'Healthcare', 'MedTech', 'Innovation'],
      metadata: {
        funding_goal: 750000,
        stage: 'MVP',
        category: 'Healthcare'
      }
    },
    {
      type: 'idea',
      id: 'ai-rec-2',
      title: 'Sustainable Energy Storage Solution',
      description: 'Next-generation battery technology for renewable energy storage with 3x longer lifespan and faster charging.',
      confidence: 0.88,
      reason: 'Growing demand for clean energy solutions and environmental focus',
      tags: ['CleanTech', 'Sustainability', 'Energy', 'Innovation'],
      metadata: {
        funding_goal: 1200000,
        stage: 'Early Stage',
        category: 'Energy'
      }
    },
    {
      type: 'idea',
      id: 'ai-rec-3',
      title: 'EdTech Personalized Learning Platform',
      description: 'Adaptive learning platform that customizes curriculum based on student performance and learning style.',
      confidence: 0.82,
      reason: 'Education technology boom with remote learning trends',
      tags: ['EdTech', 'AI', 'Personalization', 'Education'],
      metadata: {
        funding_goal: 500000,
        stage: 'Growth',
        category: 'Education'
      }
    },
    {
      type: 'investor',
      id: 'ai-inv-1',
      title: 'Tech Ventures Capital - Active Investor',
      description: 'Venture capital firm focused on AI and healthcare technology startups with $250K-$2M investment range.',
      confidence: 0.90,
      reason: 'Actively investing in healthcare technology sector',
      tags: ['Venture Capital', 'AI', 'Healthcare'],
      metadata: {
        amount_range: { min: 250000, max: 2000000 }
      }
    },
    {
      type: 'investor',
      id: 'ai-inv-2',
      title: 'Green Future Fund - Impact Investing',
      description: 'Impact investment fund focused on sustainability and clean technology solutions.',
      confidence: 0.85,
      reason: 'Strong focus on environmental solutions and clean energy',
      tags: ['Impact Investing', 'Sustainability', 'CleanTech'],
      metadata: {
        amount_range: { min: 500000, max: 5000000 }
      }
    }
  ]

  const generateRecommendations = async (limit: number = 8): Promise<AIRecommendation[]> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Filter recommendations based on user type
      let filteredRecommendations = [...mockRecommendations]

      if (userType === 'investor') {
        // Prioritize ideas for investors
        filteredRecommendations = mockRecommendations.filter((rec: AIRecommendation) => rec.type === 'idea')
      } else if (userType === 'creator') {
        // Prioritize investors for creators
        filteredRecommendations = mockRecommendations.filter((rec: AIRecommendation) => rec.type === 'investor')
      }

      // Sort by confidence and limit
      const topRecommendations = filteredRecommendations
        .sort((a: AIRecommendation, b: AIRecommendation) => b.confidence - a.confidence)
        .slice(0, limit)

      setRecommendations(topRecommendations)
      return topRecommendations

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendations'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendationsByCategory = async (category: string, limit: number = 5): Promise<AIRecommendation[]> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const categoryRecommendations = mockRecommendations
        .filter((rec: AIRecommendation) =>
          rec.metadata?.category === category ||
          rec.tags.includes(category)
        )
        .slice(0, limit)

      return categoryRecommendations

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get category recommendations'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const getPersonalizedRecommendations = async (
    preferences?: {
      industries?: string[]
      investmentRange?: { min: number; max: number }
    },
    limit: number = 8
  ): Promise<AIRecommendation[]> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 800))

      let personalizedRecommendations = [...mockRecommendations]

      // Filter by industries if specified
      if (preferences?.industries && preferences.industries.length > 0) {
        personalizedRecommendations = mockRecommendations.filter((rec: AIRecommendation) =>
          preferences.industries!.some((industry: string) =>
            rec.metadata?.category === industry ||
            rec.tags.includes(industry)
          )
        )
      }

      // Filter by investment range if user is investor
      if (preferences?.investmentRange && userType === 'investor') {
        personalizedRecommendations = personalizedRecommendations.filter((rec: AIRecommendation) =>
          rec.metadata?.funding_goal &&
          rec.metadata.funding_goal >= preferences.investmentRange!.min &&
          rec.metadata.funding_goal <= preferences.investmentRange!.max
        )
      }

      return personalizedRecommendations
        .sort((a: AIRecommendation, b: AIRecommendation) => b.confidence - a.confidence)
        .slice(0, limit)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get personalized recommendations'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  const getAIInsights = async (): Promise<{
    topInterests: string[]
    suggestedActions: string[]
    marketOpportunities: string[]
  }> => {
    return {
      topInterests: ['AI', 'Healthcare', 'Sustainability'],
      suggestedActions: [
        'Explore AI-powered healthcare solutions',
        'Consider sustainable energy investments',
        'Look into EdTech opportunities'
      ],
      marketOpportunities: [
        'Healthcare AI market growing at 40% annually',
        'Clean energy sector attracting $100B+ investments',
        'EdTech market expanding with remote learning trends'
      ]
    }
  }

  // Auto-generate recommendations on mount
  useEffect(() => {
    if (userId && userType) {
      generateRecommendations()
    }
  }, [userId, userType])

  return {
    recommendations,
    isLoading,
    error,
    generateRecommendations,
    getRecommendationsByCategory,
    getPersonalizedRecommendations,
    getAIInsights,
    // Utility functions
    refreshRecommendations: () => generateRecommendations(),
    clearRecommendations: () => setRecommendations([]),
  }
}