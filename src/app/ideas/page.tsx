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
// Using mock data for now since this is a Supabase project
// import { useQuery } from "convex/react";
// import { api } from "@/lib/convex";
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

  // Using mock data for now since this is a Supabase project
  const businessIdeas: BusinessIdea[] = [
    {
      id: "1",
      creatorId: "creator1",
      title: "AI-Powered Healthcare Platform",
      description: "Revolutionary healthcare platform using AI for early disease detection and personalized treatment plans.",
      category: "Healthcare",
      tags: ["AI", "Healthcare", "Medical"],
      fundingGoal: 500000,
      currentFunding: 150000,
      equityOffered: 15,
      valuation: 3000000,
      stage: "mvp",
      timeline: "12 months",
      teamSize: 8,
      status: "published",
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: "2",
      creatorId: "creator2",
      title: "Sustainable Fashion Marketplace",
      description: "Online marketplace connecting sustainable fashion brands with eco-conscious consumers.",
      category: "E-commerce",
      tags: ["Sustainability", "Fashion", "E-commerce"],
      fundingGoal: 250000,
      currentFunding: 75000,
      equityOffered: 20,
      valuation: 1000000,
      stage: "early",
      timeline: "8 months",
      teamSize: 5,
      status: "published",
      createdAt: Date.now() - 172800000,
      updatedAt: Date.now() - 172800000,
    },
  ];

  useEffect(() => {
    setIdeas(businessIdeas);
    setFilteredIdeas(businessIdeas);
    setIsLoading(false);
  }, []);

  // Static categories for now
  const categories = ["all", "Healthcare", "E-commerce", "Finance", "Technology"];

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white">Business Ideas</h1>
                  <p className="text-slate-300 mt-2">
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

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Business Ideas</h1>
              <p className="text-slate-300 mt-2">
                Discover innovative business opportunities from entrepreneurs worldwide
              </p>
            </div>
            {user?.userType === "creator" && (
              <Link href="/ideas/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Submit Your Idea</Button>
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
            <p className="text-slate-300">
              {isSearching ? (
                "Searching..."
              ) : (
                <>
                  Found <span className="font-semibold text-white">{searchResults.length}</span> results
                  {searchStats.hasFilters && (
                    <span className="text-sm text-blue-400">• Filtered</span>
                  )}
                </>
              )}
            </p>

            {searchStats.avgRelevance > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Avg. Relevance:</span>
                <Badge variant={searchStats.avgRelevance > 0.7 ? "default" : "secondary"} className={searchStats.avgRelevance > 0.7 ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-600 hover:bg-slate-500 text-slate-200"}>
                  {Math.round(searchStats.avgRelevance * 100)}%
                </Badge>
              </div>
            )}
          </div>

          {searchStats.topCategories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Top categories:</span>
              {searchStats.topCategories.slice(0, 2).map(([category, count]) => (
                <Badge key={category} variant="outline" className="text-xs border-slate-500 text-slate-300 hover:bg-slate-700">
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
