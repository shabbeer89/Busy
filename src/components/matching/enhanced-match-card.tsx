"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import { Layout } from '@/components/responsive/layout'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Shield,
  MapPin,
  Award,
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import type { MatchResult } from '@/lib/matching-algorithm'

interface EnhancedMatchCardProps {
  match: MatchResult
  currentUserType: 'creator' | 'investor'
  onViewDetails?: (match: MatchResult) => void
  onStartConversation?: (match: MatchResult) => void
  onToggleFavorite?: (match: MatchResult) => void
  onShare?: (match: MatchResult) => void
  isFavorite?: boolean
  isRealTimeUpdating?: boolean
  lastUpdated?: Date | null
  className?: string
}

export function EnhancedMatchCard({
  match,
  currentUserType,
  onViewDetails,
  onStartConversation,
  onToggleFavorite,
  onShare,
  isFavorite: propIsFavorite,
  isRealTimeUpdating = false,
  lastUpdated,
  className,
}: EnhancedMatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Use the favorites hook for state management
  const { isItemFavorited, toggleFavorite, isLoading: favoritesLoading } = useFavorites()

  // Local loading state for operations
  const [operationLoading, setOperationLoading] = useState<string | null>(null)
  const [operationError, setOperationError] = useState<string | null>(null)

  // Determine favorite status from props or hook
  const isFavorite = propIsFavorite ?? isItemFavorited(match.idea_id) ?? isItemFavorited(match.offer_id)

  // Handle favorite toggle with proper item type
  const handleToggleFavorite = async () => {
    if (favoritesLoading || operationLoading) return

    setOperationLoading('favorite')
    setOperationError(null)

    try {
      const itemType = currentUserType === 'creator' ? 'idea' : 'offer'
      const itemId = currentUserType === 'creator' ? match.idea_id : match.offer_id

      const result = await toggleFavorite(itemId, itemType)
      if (result.success) {
        onToggleFavorite?.(match)
      } else {
        setOperationError(result.error || 'Failed to update favorite')
      }
    } catch (error) {
      setOperationError('An unexpected error occurred')
    } finally {
      setOperationLoading(null)
    }
  }

  // Handle share functionality
  const handleShare = async () => {
    if (operationLoading) return

    setOperationLoading('share')
    setOperationError(null)

    try {
      const shareText = `Check out this ${currentUserType === 'creator' ? 'investment opportunity' : 'business idea'} match!`
      const shareUrl = window.location.origin + (currentUserType === 'creator' ? `/offers/${match.offer_id}` : `/ideas/${match.idea_id}`)

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Strategic Partnership Match',
            text: shareText,
            url: shareUrl,
          })
        } catch (error) {
          // User cancelled or error, fallback to clipboard
          await navigator.clipboard.writeText(shareUrl)
        }
      } else {
        // Fallback for browsers without Web Share API
        await navigator.clipboard.writeText(shareUrl)
      }

      onShare?.(match)
    } catch (error) {
      setOperationError('Failed to share')
    } finally {
      setOperationLoading(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    if (score >= 0.6) return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
    return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
  }

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
      case 'low': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUserType === 'creator' ? 'I' : 'C'}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background",
                  getScoreColor(match.match_score)
                )}
                role="img"
                aria-label={`Match score: ${Math.round(match.match_score * 100)}%`}
              />
            </div>
            <div>
              <CardTitle
                id={`match-title-${match.idea_id}`}
                className="text-base font-medium"
              >
                Match #{match.idea_id.slice(-6)}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge className={getConfidenceBadge(match.confidence)}>
                  {match.confidence} confidence
                </Badge>
                <span>
                  {new Date(match.created_at).toLocaleDateString()}
                </span>
                {isRealTimeUpdating && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                    <span className="text-green-600 dark:text-green-400">Live</span>
                  </div>
                )}
              </CardDescription>
            </div>
          </div>

          <div className="text-right">
            <div
              className={cn(
                "text-2xl font-bold",
                getScoreColor(match.match_score)
              )}
              role="text"
              aria-label={`Match score: ${Math.round(match.match_score * 100)} percent`}
            >
              {Math.round(match.match_score * 100)}%
            </div>
            <div className="text-xs text-muted-foreground" aria-hidden="true">match score</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Match Factors Overview */}
        <div className="grid grid-cols-2 gap-4 mb-4" role="region" aria-label="Match compatibility factors">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Amount Fit</span>
            </div>
            <Progress
              value={match.factors.amountCompatibility * 100}
              className="h-2"
              aria-label={`Amount compatibility: ${Math.round(match.factors.amountCompatibility * 100)}%`}
            />
            <div className="text-xs text-muted-foreground" aria-hidden="true">
              {Math.round(match.factors.amountCompatibility * 100)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Industry</span>
            </div>
            <Progress
              value={match.factors.industryAlignment * 100}
              className="h-2"
              aria-label={`Industry alignment: ${Math.round(match.factors.industryAlignment * 100)}%`}
            />
            <div className="text-xs text-muted-foreground" aria-hidden="true">
              {Math.round(match.factors.industryAlignment * 100)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Stage</span>
            </div>
            <Progress
              value={match.factors.stagePreference * 100}
              className="h-2"
              aria-label={`Stage preference: ${Math.round(match.factors.stagePreference * 100)}%`}
            />
            <div className="text-xs text-muted-foreground" aria-hidden="true">
              {Math.round(match.factors.stagePreference * 100)}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Risk</span>
            </div>
            <Progress
              value={match.factors.riskAlignment * 100}
              className="h-2"
              aria-label={`Risk alignment: ${Math.round(match.factors.riskAlignment * 100)}%`}
            />
            <div className="text-xs text-muted-foreground" aria-hidden="true">
              {Math.round(match.factors.riskAlignment * 100)}%
            </div>
          </div>
        </div>

        {/* Match Reasoning */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <Button
            variant="ghost"
            className="w-full justify-between p-0 h-auto"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={`match-reasoning-${match.idea_id}`}
          >
            <span className="text-sm font-medium">Why this match?</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>

          <CollapsibleContent
            className="mt-3 space-y-2"
          >
            {match.reasoning.map((reason, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" aria-hidden="true" />
                <span className="text-muted-foreground">{reason}</span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Error Display */}
        {operationError && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {operationError}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4" role="group" aria-label="Match actions">
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(match)}
              aria-label={`View details for match ${match.idea_id.slice(-6)}`}
            >
              <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
              View Details
            </Button>
          )}

          {onStartConversation && (
            <Button
              size="sm"
              onClick={() => onStartConversation(match)}
              aria-label={`Start conversation about match ${match.idea_id.slice(-6)}`}
            >
              <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
              Start Chat
            </Button>
          )}

          <div className="ml-auto flex gap-1" role="group" aria-label="Quick actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              disabled={favoritesLoading || operationLoading !== null}
              className={cn(
                "transition-colors",
                isFavorite && "text-red-500 hover:text-red-600",
                (favoritesLoading || operationLoading === 'favorite') && "opacity-50 cursor-not-allowed"
              )}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={isFavorite}
            >
              {operationLoading === 'favorite' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              disabled={operationLoading !== null}
              className={cn(
                "transition-colors",
                operationLoading === 'share' && "opacity-50 cursor-not-allowed"
              )}
              aria-label="Share this match"
            >
              {operationLoading === 'share' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Share2 className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Real-time update info */}
        {lastUpdated && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
              {isRealTimeUpdating && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
                  Auto-updating
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced match statistics component
interface MatchStatisticsProps {
  statistics: {
    totalMatches: number
    highConfidenceMatches: number
    mediumConfidenceMatches: number
    averageScore: number
    topFactors: Array<{ factor: string; average: number }>
    improvementSuggestions: string[]
  }
  className?: string
}

export function MatchStatistics({
  statistics,
  className,
}: MatchStatisticsProps) {
  const getFactorLabel = (factor: string) => {
    const labels: Record<string, string> = {
      amountCompatibility: 'Amount Fit',
      industryAlignment: 'Industry Match',
      stagePreference: 'Stage Alignment',
      riskAlignment: 'Risk Profile',
    }
    return labels[factor] || factor
  }

  const getFactorIcon = (factor: string) => {
    const icons: Record<string, any> = {
      amountCompatibility: DollarSign,
      industryAlignment: Target,
      stagePreference: TrendingUp,
      riskAlignment: Shield,
    }
    return icons[factor] || Target
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Match Statistics
        </CardTitle>
        <CardDescription>
          Analysis of your matching performance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {statistics.totalMatches}
            </div>
            <div className="text-sm text-muted-foreground">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {statistics.highConfidenceMatches}
            </div>
            <div className="text-sm text-muted-foreground">High Quality</div>
          </div>
        </div>

        {/* Average Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Match Score</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(statistics.averageScore * 100)}%
            </span>
          </div>
          <Progress value={statistics.averageScore * 100} className="h-2" />
        </div>

        {/* Top Performing Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Top Performing Factors</h4>
          {statistics.topFactors.slice(0, 3).map((factor, index) => {
            const Icon = getFactorIcon(factor.factor)
            return (
              <div key={factor.factor} className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getFactorLabel(factor.factor)}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {Math.round(factor.average * 100)}%
                  </div>
                  <Progress value={factor.average * 100} className="h-2 w-20" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Improvement Suggestions */}
        {statistics.improvementSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-orange-600">Suggestions for Improvement</h4>
            {statistics.improvementSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                <span className="text-muted-foreground">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Match filter component
interface MatchFilterProps {
  filters: {
    minScore: number
    maxScore: number
    confidence: string[]
    sortBy: 'score' | 'recent' | 'confidence'
  }
  onFiltersChange: (filters: MatchFilterProps['filters']) => void
  className?: string
}

export function MatchFilter({
  filters,
  onFiltersChange,
  className,
}: MatchFilterProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Score Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Min Score:</label>
            <select
              value={filters.minScore}
              onChange={(e) => onFiltersChange({
                ...filters,
                minScore: Number(e.target.value)
              })}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={0}>0%</option>
              <option value={0.5}>50%</option>
              <option value={0.7}>70%</option>
              <option value={0.8}>80%</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Confidence:</label>
            <div className="flex gap-1">
              {['high', 'medium', 'low'].map((level) => (
                <Button
                  key={level}
                  variant={filters.confidence.includes(level) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newConfidence = filters.confidence.includes(level)
                      ? filters.confidence.filter(c => c !== level)
                      : [...filters.confidence, level]
                    onFiltersChange({ ...filters, confidence: newConfidence })
                  }}
                  className="text-xs capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium">Sort by:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({
                ...filters,
                sortBy: e.target.value as any
              })}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="score">Score</option>
              <option value="recent">Recent</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
