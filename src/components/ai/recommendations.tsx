"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MobileCard } from '@/components/responsive/mobile-layout'
import { useAIRecommendations } from '@/hooks/use-ai-recommendations'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Filter,
  Star,
  Clock,
  DollarSign,
} from 'lucide-react'

interface AIRecommendationsProps {
  userId?: string
  userType?: 'creator' | 'investor'
  maxRecommendations?: number
  className?: string
}

export function AIRecommendations({
  userId,
  userType,
  maxRecommendations = 6,
  className,
}: AIRecommendationsProps) {
  const {
    recommendations,
    isLoading,
    error,
    generateRecommendations,
    getAIInsights,
  } = useAIRecommendations(userId, userType)

  const [insights, setInsights] = useState<{
    topInterests: string[]
    suggestedActions: string[]
    marketOpportunities: string[]
  } | null>(null)

  // Load AI insights
  useEffect(() => {
    const loadInsights = async () => {
      if (userId) {
        const aiInsights = await getAIInsights()
        setInsights(aiInsights)
      }
    }
    loadInsights()
  }, [userId, getAIInsights])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'idea':
        return <Lightbulb className="h-4 w-4" />
      case 'investor':
        return <Users className="h-4 w-4" />
      case 'content':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            AI Recommendations
          </h2>
          <p className="text-muted-foreground">
            Personalized suggestions powered by artificial intelligence
          </p>
        </div>

        <Button
          onClick={() => generateRecommendations(maxRecommendations)}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Target className="h-4 w-4" />
              <span className="text-sm">Failed to load recommendations: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MobileCard key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </MobileCard>
          ))}
        </div>
      )}

      {/* Recommendations Grid */}
      {!isLoading && recommendations.length > 0 && (
        <div className="grid gap-4">
          {recommendations.map((rec, index) => (
            <MobileCard key={rec.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Recommendation Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    rec.type === 'idea' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                    rec.type === 'investor' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                    'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                  )}>
                    {getTypeIcon(rec.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">
                        {rec.title}
                      </h3>

                      {/* Confidence Score */}
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={getConfidenceColor(rec.confidence)}>
                          {Math.round(rec.confidence * 100)}%
                        </Badge>
                        {index < 3 && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {rec.description}
                    </p>

                    {/* Reason */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{rec.reason}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {rec.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {rec.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{rec.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Metadata */}
                    {rec.metadata && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        {rec.metadata.funding_goal && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(rec.metadata.funding_goal)}</span>
                          </div>
                        )}
                        {rec.metadata.stage && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{rec.metadata.stage}</span>
                          </div>
                        )}
                        {rec.metadata.category && (
                          <Badge variant="secondary" className="text-xs">
                            {rec.metadata.category}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button size="sm" className="w-full">
                      {rec.type === 'idea' ? 'View Opportunity' : 'Learn More'}
                      <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </MobileCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && !error && (
        <MobileCard>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete your profile to get personalized AI recommendations
            </p>
            <Button onClick={() => generateRecommendations(maxRecommendations)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Recommendations
            </Button>
          </CardContent>
        </MobileCard>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Interests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Your Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.topInterests.map(interest => (
                  <Badge key={interest} variant="outline" className="mr-2">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Suggested Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.suggestedActions.map((action, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Opportunities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Market Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.marketOpportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{opportunity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Recommendations Filter Component
interface RecommendationsFilterProps {
  userType: 'creator' | 'investor'
  onFilterChange: (filters: {
    type?: string
    minConfidence?: number
    category?: string
  }) => void
  className?: string
}

export function RecommendationsFilter({
  userType,
  onFilterChange,
  className,
}: RecommendationsFilterProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [minConfidence, setMinConfidence] = useState(0.5)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    onFilterChange({
      type: selectedType === 'all' ? undefined : selectedType,
      minConfidence,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    })
  }, [selectedType, minConfidence, selectedCategory, onFilterChange])

  return (
    <MobileCard className={className}>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="idea">Ideas</option>
              <option value="investor">Investors</option>
              <option value="content">Content</option>
            </select>
          </div>

          {/* Minimum Confidence */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Min Confidence:</label>
            <select
              value={minConfidence}
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={0.3}>30%</option>
              <option value={0.5}>50%</option>
              <option value={0.7}>70%</option>
              <option value={0.8}>80%</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Energy">Energy</option>
            </select>
          </div>
        </div>
      </CardContent>
    </MobileCard>
  )
}