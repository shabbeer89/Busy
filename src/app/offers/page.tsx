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
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

// Use Convex query to get active investment offers
export default function OffersPage() {
  const { user } = useAuth();
  const rawInvestmentOffers = useQuery(api.investmentOffers.getActiveOffers) || [];
  const [offers, setOffers] = useState<any[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);

  // Memoize offers to prevent unnecessary re-renders
  const investmentOffers = useMemo(() => {
    if (rawInvestmentOffers && rawInvestmentOffers.length > 0 && rawInvestmentOffers[0]._id) {
      return rawInvestmentOffers.map((offer: any) => ({
        id: offer._id,
        title: offer.title,
        description: offer.description,
        amountRange: offer.amountRange,
        preferredEquity: offer.preferredEquity,
        preferredStages: offer.preferredStages,
        preferredIndustries: offer.preferredIndustries,
        investmentType: offer.investmentType,
        isActive: offer.isActive,
        createdAt: offer.createdAt,
      }));
    }
    return [];
  }, [rawInvestmentOffers]);

  // Convert Convex data format to component format
  useEffect(() => {
    if (investmentOffers.length > 0) {
      setOffers(investmentOffers);
      setFilteredOffers(investmentOffers);
      setIsLoadingOffers(false);
    } else if (investmentOffers.length === 0 && !isLoadingOffers) {
      // Only update if not already loading to prevent infinite loop
      setOffers([]);
      setFilteredOffers([]);
      setIsLoadingOffers(false);
    }
  }, [investmentOffers, isLoadingOffers]);

  // Filter offers based on search and filters
  useEffect(() => {
    let filtered = offers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.preferredIndustries.some((industry: string) =>
          industry.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(offer =>
        offer.preferredIndustries.some((industry: string) =>
          industry.toLowerCase() === industryFilter.toLowerCase()
        )
      );
    }

    // Stage filter
    if (stageFilter !== "all") {
      filtered = filtered.filter(offer =>
        offer.preferredStages.includes(stageFilter)
      );
    }

    setFilteredOffers(filtered);
  }, [offers, searchQuery, industryFilter, stageFilter]);

  // Get unique industries for filter
  const industries = Array.from(
    new Set(offers.flatMap(offer => offer.preferredIndustries))
  );

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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">Please sign in to view investment offers.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Offers</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Discover investment opportunities that match your business ideas
              </p>
            </div>
            {user.userType === "investor" && (
              <Link href="/offers/create">
                <Button>Create Investment Offer</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Search Offers
                </label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, description, or industries..."
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Filter by Industry
                </label>
                <select
                  id="industry"
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="all">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Filter by Stage
                </label>
                <select
                  id="stage"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white capitalize"
                >
                  <option value="all">All Stages</option>
                  {["startup", "early", "growth", "mature"].map(stage => (
                    <option key={stage} value={stage} className="capitalize">
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredOffers.length} of {offers.length} investment offers
          </p>
        </div>

        {/* Offers Grid */}
        {isLoadingOffers ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <OfferCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No offers found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchQuery || industryFilter !== "all" || stageFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No investment offers available at the moment"
                  }
                </p>
              </div>
            ) : (
              filteredOffers.map((offer) => (
                <Card key={offer.id} className="">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {offer.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {offer.investmentType} • {offer.preferredStages.join(", ")} stage
                        </p>
                      </div>
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {offer.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {offer.preferredIndustries.slice(0, 3).map((industry: string) => (
                          <Badge key={industry} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {offer.preferredIndustries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{offer.preferredIndustries.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Investment Range</p>
                        <p className="text-lg font-semibold text-green-400">
                          {formatCurrency(offer.amountRange.min)} - {formatCurrency(offer.amountRange.max)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Equity</p>
                        <p className="text-lg font-semibold text-blue-400">
                          {offer.preferredEquity.min}% - {offer.preferredEquity.max}%
                        </p>
                      </div>
                    </div>

                    <Link href={`/offers/${offer.id}`}>
                      <Button className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
