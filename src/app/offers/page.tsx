"use client";

import { useState, useEffect } from "react";
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
  const investmentOffers = useQuery(api.investmentOffers.getActiveOffers) || [];
  const [offers, setOffers] = useState<any[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);

  // Convert Convex data format to component format
  useEffect(() => {
    if (investmentOffers && investmentOffers.length > 0 && investmentOffers[0]._id) {
      const convertedOffers = investmentOffers.map((offer: any) => ({
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

      setOffers(convertedOffers);
      setFilteredOffers(convertedOffers);
      setIsLoadingOffers(false);
    } else {
      // No fallback data - show empty state
      setOffers([]);
      setFilteredOffers([]);
      setIsLoadingOffers(false);
    }
  }, [investmentOffers]);

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

        {/* Offers Grid */}
        {isLoadingOffers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <OfferCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOffers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No investment offers found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredOffers.map((offer) => (
                <Card key={offer.id} className="">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{offer.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {offer.description}
                        </CardDescription>
                      </div>
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Range</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(offer.amountRange.min)} - {formatCurrency(offer.amountRange.max)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Equity Range</p>
                        <p className="text-lg font-semibold">
                          {offer.preferredEquity.min}% - {offer.preferredEquity.max}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Type</p>
                        <p className="text-lg font-semibold capitalize">{offer.investmentType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Posted</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatTimeAgo(offer.createdAt)}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Industries</p>
                      <div className="flex flex-wrap gap-2">
                        {offer.preferredIndustries.map((industry: string) => (
                          <Badge key={industry} variant="outline">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Stages</p>
                      <div className="flex flex-wrap gap-2">
                        {offer.preferredStages.map((stage: string) => (
                          <Badge key={stage} variant="outline" className="capitalize">
                            {stage}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button>View Details</Button>
                    </div>
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