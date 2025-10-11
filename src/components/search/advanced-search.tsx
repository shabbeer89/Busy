"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MobileCard } from '@/components/responsive/mobile-layout'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Bookmark,
  X,
  SlidersHorizontal,
  ChevronDown,
  Star,
  Clock,
  Target,
} from 'lucide-react'

interface SearchFilters {
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

interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  className?: string
}

const CATEGORIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education',
  'Real Estate', 'Food & Beverage', 'Entertainment', 'Transportation', 'Energy'
]

const STAGES = [
  'Concept', 'MVP', 'Early Stage', 'Growth', 'Mature'
]

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'recent', label: 'Most Recent' },
  { value: 'funding', label: 'Funding Amount' },
  { value: 'popular', label: 'Most Popular' }
]

export function AdvancedSearch({
  onFiltersChange,
  initialFilters = {},
  className
}: AdvancedSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    fundingRange: { min: 0, max: 10000000 },
    stage: [],
    location: '',
    tags: [],
    sortBy: 'relevance',
    verifiedOnly: false,
    ...initialFilters
  })

  const [tagInput, setTagInput] = useState('')

  // Update parent component when filters change
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = <K extends keyof SearchFilters>(
    key: K,
    value: string
  ) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]

    setFilters(prev => ({ ...prev, [key]: newArray }))
  }

  const addTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: [],
      fundingRange: { min: 0, max: 10000000 },
      stage: [],
      location: '',
      tags: [],
      sortBy: 'relevance',
      verifiedOnly: false
    })
  }

  const hasActiveFilters =
    filters.query ||
    filters.category.length > 0 ||
    filters.stage.length > 0 ||
    filters.location ||
    filters.tags.length > 0 ||
    filters.verifiedOnly ||
    filters.fundingRange.min > 0 ||
    filters.fundingRange.max < 10000000

  return (
    <MobileCard className={cn("mb-6", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <CardDescription>
              Find the perfect business opportunities with intelligent filtering
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {isExpanded ? 'Less' : 'More'} Filters
              <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or keywords..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.verifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            className="flex items-center gap-1"
          >
            <Star className="h-3 w-3" />
            Verified Only
          </Button>

          {CATEGORIES.slice(0, 4).map(category => (
            <Button
              key={category}
              variant={filters.category.includes(category) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter('category', category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-border">
            {/* Categories */}
            <div>
              <label className="text-sm font-medium mb-3 block">Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={filters.category.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('category', category)}
                    className="justify-start text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div>
              <label className="text-sm font-medium mb-3 block">Business Stage</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {STAGES.map(stage => (
                  <Button
                    key={stage}
                    variant={filters.stage.includes(stage) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('stage', stage)}
                    className="justify-start text-xs"
                  >
                    {stage}
                  </Button>
                ))}
              </div>
            </div>

            {/* Funding Range */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Funding Range: ${filters.fundingRange.min.toLocaleString()} - ${filters.fundingRange.max.toLocaleString()}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Minimum</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.fundingRange.min}
                    onChange={(e) => updateFilter('fundingRange', {
                      ...filters.fundingRange,
                      min: Number(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Maximum</label>
                  <Input
                    type="number"
                    placeholder="10000000"
                    value={filters.fundingRange.max}
                    onChange={(e) => updateFilter('fundingRange', {
                      ...filters.fundingRange,
                      max: Number(e.target.value)
                    })}
                  />
                </div>
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="100000"
                  value={filters.fundingRange.min}
                  onChange={(e) => updateFilter('fundingRange', {
                    ...filters.fundingRange,
                    min: Number(e.target.value)
                  })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Input
                placeholder="Enter city, state, or country..."
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>

            {filters.query && (
              <Badge variant="outline" className="flex items-center gap-1">
                Search: {filters.query}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('query', '')} />
              </Badge>
            )}

            {filters.category.map(cat => (
              <Badge key={cat} variant="outline" className="flex items-center gap-1">
                {cat}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('category', cat)} />
              </Badge>
            ))}

            {filters.stage.map(stage => (
              <Badge key={stage} variant="outline" className="flex items-center gap-1">
                {stage}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayFilter('stage', stage)} />
              </Badge>
            ))}

            {filters.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.location}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('location', '')} />
              </Badge>
            )}

            {(filters.fundingRange.min > 0 || filters.fundingRange.max < 10000000) && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                ${filters.fundingRange.min.toLocaleString()}-${filters.fundingRange.max.toLocaleString()}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('fundingRange', { min: 0, max: 10000000 })} />
              </Badge>
            )}
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <label className="text-sm font-medium">Sort by:</label>
          <div className="flex gap-2">
            {SORT_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant={filters.sortBy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('sortBy', option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </MobileCard>
  )
}

// Search Results Component
interface SearchResultsProps {
  results: any[]
  isLoading?: boolean
  error?: string | null
  totalResults?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  className?: string
}

export function SearchResults({
  results,
  isLoading = false,
  error = null,
  totalResults = 0,
  currentPage = 1,
  onPageChange,
  className
}: SearchResultsProps) {
  if (error) {
    return (
      <MobileCard className={className}>
        <CardContent className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <Target className="h-8 w-8 mx-auto mb-2" />
            Search Error
          </div>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </MobileCard>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Searching...' : `Found ${totalResults} results`}
        </p>
        {results.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Page {currentPage}
          </Badge>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <MobileCard key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </MobileCard>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <MobileCard key={result.id || index}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {result.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {result.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.stage}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {result.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Funding: </span>
                      <span className="font-semibold text-green-400">
                        ${result.fundingGoal?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-right">
                      <span className="text-muted-foreground">Equity: </span>
                      <span className="font-semibold text-blue-400">
                        {result.equityOffered}%
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </MobileCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && !error && (
        <MobileCard>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all ideas
            </p>
            <Button variant="outline">
              Browse All Ideas
            </Button>
          </CardContent>
        </MobileCard>
      )}
    </div>
  )
}