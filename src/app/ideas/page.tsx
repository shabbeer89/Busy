"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BusinessIdea } from "@/types";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { IdeaCardSkeleton } from "@/components/ui/skeleton";
import { AdvancedSearch, SearchResults } from "@/components/search/advanced-search";
import { useAdvancedSearch } from "@/hooks/use-advanced-search";

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<BusinessIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Advanced search system
  const {
    filters,
    setFilters,
    results: searchResults,
    searchStats,
    isSearching,
    isLoading: searchLoading,
    clearFilters
  } = useAdvancedSearch();

  // Use Convex query to get published business ideas (with fallback)
  const rawBusinessIdeas = useQuery(api.businessIdeas?.getPublishedIdeas) || [];

  // Fetch dynamic categories
  const dynamicCategories = useQuery(api.analytics.getAvailableCategories) || [];

  // Memoize the converted ideas to prevent unnecessary re-renders
  const businessIdeas = useMemo(() => {
    if (rawBusinessIdeas && rawBusinessIdeas.length > 0 && rawBusinessIdeas[0]._id) {
      return rawBusinessIdeas.map((idea: any) => ({
        id: idea._id,
        creatorId: idea.creatorId,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tags: idea.tags || [],
        fundingGoal: idea.fundingGoal,
        currentFunding: idea.currentFunding,
        equityOffered: idea.equityOffered,
        valuation: idea.valuation,
        stage: idea.stage,
        timeline: idea.timeline,
        teamSize: idea.teamSize,
        status: idea.status,
        createdAt: idea.createdAt || Date.now(),
        updatedAt: idea.updatedAt || Date.now(),
      })) as BusinessIdea[];
    }
    return [];
  }, [rawBusinessIdeas]);

  useEffect(() => {
    if (businessIdeas.length > 0) {
      setIdeas(businessIdeas);
      setFilteredIdeas(businessIdeas);
      setIsLoading(false);
    } else if (businessIdeas.length === 0 && !isLoading) {
      // Only set loading to false if we've already tried loading
      setIsLoading(false);
    }
  }, [businessIdeas, isLoading]);


  // Combine "all" with dynamic categories from the database
  const categories = ["all", ...dynamicCategories];

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Ideas</h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Discover innovative business opportunities from entrepreneurs worldwide
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <IdeaCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
          <SidebarLayout>

    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Ideas</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Discover innovative business opportunities from entrepreneurs worldwide
              </p>
            </div>
            {user?.userType === "creator" && (
              <Link href="/ideas/create">
                <Button>Submit Your Idea</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Advanced Search */}
        <AdvancedSearch
          onFiltersChange={setFilters}
          initialFilters={{
            query: searchTerm,
            category: selectedCategory !== "all" ? [selectedCategory] : []
          }}
          className="mb-8"
        />

        {/* Search Statistics */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-gray-600 dark:text-gray-300">
              {isSearching ? (
                "Searching..."
              ) : (
                <>
                  Found <span className="font-semibold">{searchResults.length}</span> results
                  {searchStats.hasFilters && (
                    <span className="text-sm text-blue-400">• Filtered</span>
                  )}
                </>
              )}
            </p>

            {searchStats.avgRelevance > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Avg. Relevance:</span>
                <Badge variant={searchStats.avgRelevance > 0.7 ? "default" : "secondary"}>
                  {Math.round(searchStats.avgRelevance * 100)}%
                </Badge>
              </div>
            )}
          </div>

          {searchStats.topCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Top categories:</span>
              {searchStats.topCategories.slice(0, 2).map(([category, count]) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category} ({count})
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        <SearchResults
          results={searchResults.map(result => ({
            id: result.id,
            title: result.title,
            description: result.description,
            category: result.category,
            tags: result.tags,
            fundingGoal: result.fundingGoal,
            equityOffered: result.equityOffered,
            stage: result.stage,
            location: result.location,
            isVerified: result.isVerified,
            creatorName: result.creatorName,
            createdAt: result.createdAt,
            relevanceScore: result.relevanceScore
          }))}
          isLoading={isSearching || searchLoading}
          totalResults={searchResults.length}
        />
      </div>
    </div>
    </SidebarLayout>
  );
}
