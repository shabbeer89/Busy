"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OfferCardSkeleton } from "@/components/ui/skeleton";
import { animations } from "@/lib/animations";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { createClient } from "@/lib/supabase";
import { AdvancedSearch, SearchResults } from "@/components/search/advanced-search";
import { useAdvancedSearch } from "@/hooks/use-advanced-search";

// Use Supabase to get active investment offers
export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const supabase = createClient();

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

  // Fetch offers from Supabase
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('investment_offers')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        if (data) {
          setOffers(data);
        }
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchOffers();
  }, [supabase]);

  // Convert offers to search results format
  const searchFormattedOffers = offers.map(offer => ({
    id: offer.id,
    title: offer.title,
    description: offer.description,
    category: offer.investmentType || 'Investment',
    tags: offer.preferredIndustries || [],
    fundingGoal: offer.amountRange?.max || 0,
    equityOffered: offer.preferredEquity?.max || 0,
    stage: 'early', // Default stage
    location: '',
    isVerified: true,
    creatorName: 'Investor',
    createdAt: offer.createdAt || new Date().toISOString(),
    relevanceScore: 1.0
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-slate-300 mb-4">Please sign in to view investment offers.</p>
            <Link href="/auth/login">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Sign In</Button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Investment Offers</h1>
              <p className="text-slate-300 mt-2">
                Discover investment opportunities that match your business ideas
              </p>
            </div>
            {user.userType === "investor" && (
              <Link href="/offers/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Create Investment Offer</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Advanced Search */}
        <AdvancedSearch
          onFiltersChange={setFilters}
          initialFilters={{
            query: '',
            category: [],
            fundingRange: { min: 0, max: 10000000 },
            stage: [],
            location: '',
            tags: [],
            sortBy: 'relevance',
            verifiedOnly: false
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
          results={searchFormattedOffers}
          isLoading={isLoadingOffers || isSearching || searchLoading}
          totalResults={searchResults.length || searchFormattedOffers.length}
        />
      </div>
    </SidebarLayout>
  );
}
