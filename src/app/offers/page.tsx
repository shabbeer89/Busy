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

// Mock data for demonstration - in real app this would come from Convex
const mockOffers = [
  {
    id: "1",
    title: "Tech Startup Investment",
    description: "Looking to invest in early-stage technology companies with strong growth potential.",
    amountRange: { min: 50000, max: 200000 },
    preferredEquity: { min: 10, max: 25 },
    preferredStages: ["mvp", "early"],
    preferredIndustries: ["Technology", "SaaS", "AI"],
    investmentType: "equity",
    isActive: true,
    createdAt: Date.now() - 86400000, // 1 day ago
  },
  {
    id: "2",
    title: "Healthcare Innovation Fund",
    description: "Seeking innovative healthcare solutions and medical technology startups.",
    amountRange: { min: 100000, max: 500000 },
    preferredEquity: { min: 15, max: 30 },
    preferredStages: ["concept", "mvp", "early"],
    preferredIndustries: ["Healthcare", "Biotech", "Medical Devices"],
    investmentType: "equity",
    isActive: true,
    createdAt: Date.now() - 172800000, // 2 days ago
  },
  {
    id: "3",
    title: "Sustainable Energy Investment",
    description: "Investing in clean energy solutions and sustainable technology companies.",
    amountRange: { min: 75000, max: 300000 },
    preferredEquity: { min: 10, max: 20 },
    preferredStages: ["early", "growth"],
    preferredIndustries: ["Clean Energy", "Sustainability", "Environmental"],
    investmentType: "convertible",
    isActive: true,
    createdAt: Date.now() - 259200000, // 3 days ago
  },
];

export default function OffersPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState(mockOffers);
  const [filteredOffers, setFilteredOffers] = useState(mockOffers);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  // Filter offers based on search and filters
  useEffect(() => {
    let filtered = offers;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(offer =>
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.preferredIndustries.some(industry =>
          industry.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(offer =>
        offer.preferredIndustries.some(industry =>
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
          <div className="grid gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <OfferCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOffers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No investment offers found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              filteredOffers.map((offer) => (
                <Card key={offer.id} className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${animations.cardHover} dark:bg-slate-800 dark:border-slate-700`}>
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
                        {offer.preferredIndustries.map((industry) => (
                          <Badge key={industry} variant="outline">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preferred Stages</p>
                      <div className="flex flex-wrap gap-2">
                        {offer.preferredStages.map((stage) => (
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