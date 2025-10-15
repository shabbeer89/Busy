"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Layout } from '@/components/responsive/layout'
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
    <Card className={cn("mb-6 bg-gradient-to-br from-slate-800/80 to-slate-800/60 border border-slate-600/50 hover:border-slate-500/50 hover:shadow-xl transition-all duration-300", className)}>
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Search className="h-5 w-5" />
              </div>
              Advanced Search
            </CardTitle>
            <CardDescription className="text-slate-300 mt-1">
              Find the perfect business opportunities with intelligent filtering
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-slate-400 hover:text-white hover:bg-slate-700"
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by title, description, or keywords..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-11 pr-4 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filters.verifiedOnly ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              filters.verifiedOnly
                ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
                : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
            }`}
          >
            <Star className="h-4 w-4" />
            Verified Only
          </Button>

          {CATEGORIES.slice(0, 4).map(category => (
            <Button
              key={category}
              variant={filters.category.includes(category) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleArrayFilter('category', category)}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                filters.category.includes(category)
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-6 border-t border-slate-600">
            {/* Categories */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map(category => (
                  <Button
                    key={category}
                    variant={filters.category.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('category', category)}
                    className={`justify-start text-xs h-9 transition-all duration-200 ${
                      filters.category.includes(category)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transform scale-105"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stages */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Business Stage
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {STAGES.map(stage => (
                  <Button
                    key={stage}
                    variant={filters.stage.includes(stage) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('stage', stage)}
                    className={`justify-start text-xs h-9 transition-all duration-200 ${
                      filters.stage.includes(stage)
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg transform scale-105"
                        : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
                    }`}
                  >
                    {stage}
                  </Button>
                ))}
              </div>
            </div>

            {/* Funding Range */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Funding Range: ${filters.fundingRange.min.toLocaleString()} - ${filters.fundingRange.max.toLocaleString()}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Minimum</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.fundingRange.min}
                    onChange={(e) => updateFilter('fundingRange', {
                      ...filters.fundingRange,
                      min: Number(e.target.value)
                    })}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Maximum</label>
                  <Input
                    type="number"
                    placeholder="10000000"
                    value={filters.fundingRange.max}
                    onChange={(e) => updateFilter('fundingRange', {
                      ...filters.fundingRange,
                      max: Number(e.target.value)
                    })}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-green-500 focus:ring-green-500/20"
                  />
                </div>
              </div>
              <div className="mt-4">
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
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <Input
                placeholder="Enter city, state, or country..."
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                Tags
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-pink-500 focus:ring-pink-500/20"
                />
                <Button onClick={addTag} size="sm" className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white">
                  Add
                </Button>
              </div>
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-pink-900/20 border-pink-500/30 text-pink-300">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-pink-200"
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
          <div className="space-y-3 pt-6 border-t border-slate-600">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Active filters:
            </span>
            <div className="flex flex-wrap gap-2">
              {filters.query && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-900/20 border-blue-500/30 text-blue-300">
                  Search: {filters.query}
                  <X className="h-3 w-3 cursor-pointer hover:text-blue-200" onClick={() => updateFilter('query', '')} />
                </Badge>
              )}

              {filters.category.map(cat => (
                <Badge key={cat} variant="outline" className="flex items-center gap-1 bg-purple-900/20 border-purple-500/30 text-purple-300">
                  {cat}
                  <X className="h-3 w-3 cursor-pointer hover:text-purple-200" onClick={() => toggleArrayFilter('category', cat)} />
                </Badge>
              ))}

              {filters.stage.map(stage => (
                <Badge key={stage} variant="outline" className="flex items-center gap-1 bg-indigo-900/20 border-indigo-500/30 text-indigo-300">
                  {stage}
                  <X className="h-3 w-3 cursor-pointer hover:text-indigo-200" onClick={() => toggleArrayFilter('stage', stage)} />
                </Badge>
              ))}

              {filters.location && (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-900/20 border-green-500/30 text-green-300">
                  <MapPin className="h-3 w-3" />
                  {filters.location}
                  <X className="h-3 w-3 cursor-pointer hover:text-green-200" onClick={() => updateFilter('location', '')} />
                </Badge>
              )}

              {(filters.fundingRange.min > 0 || filters.fundingRange.max < 10000000) && (
                <Badge variant="outline" className="flex items-center gap-1 bg-yellow-900/20 border-yellow-500/30 text-yellow-300">
                  <DollarSign className="h-3 w-3" />
                  ${filters.fundingRange.min.toLocaleString()}-${filters.fundingRange.max.toLocaleString()}
                  <X className="h-3 w-3 cursor-pointer hover:text-yellow-200" onClick={() => updateFilter('fundingRange', { min: 0, max: 10000000 })} />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
          <label className="text-sm font-medium text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            Sort by:
          </label>
          <div className="flex gap-2">
            {SORT_OPTIONS.map(option => (
              <Button
                key={option.value}
                variant={filters.sortBy === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('sortBy', option.value as any)}
                className={`transition-all duration-200 ${
                  filters.sortBy === option.value
                    ? "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-lg transform scale-105"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
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
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-red-400 mb-2">
            <Target className="h-8 w-8 mx-auto mb-2" />
            Search Error
          </div>
          <p className="text-sm text-slate-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {isLoading ? 'Searching...' : `Found ${totalResults} results`}
        </p>
        {results.length > 0 && (
          <Badge variant="outline" className="flex items-center gap-1 border-slate-500 text-slate-300">
            <Clock className="h-3 w-3" />
            Page {currentPage}
          </Badge>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse bg-slate-800/60 border-slate-600">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                  <div className="h-16 bg-slate-700 rounded"></div>
                  <div className="h-8 bg-slate-700 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && results.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((result, index) => (
            <Card key={result.id || index} className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 hover:border-slate-500 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-white">
                      {result.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                        {result.category}
                      </Badge>
                      {result.stage && (
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                          {result.stage}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm line-clamp-3">
                    {result.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-slate-400">Funding: </span>
                      <span className="font-semibold text-green-400">
                        ${result.fundingGoal?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-right">
                      <span className="text-slate-400">Equity: </span>
                      <span className="font-semibold text-blue-400">
                        {result.equityOffered}%
                      </span>
                    </div>
                  </div>

                  <Link href={`/ideas/${result.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && !error && (
        <Card className="bg-slate-800/60 border-slate-600">
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2 text-white">No results found</h3>
            <p className="text-slate-400 mb-4">
              Try adjusting your search criteria or browse all ideas
            </p>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              Browse All Ideas
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
