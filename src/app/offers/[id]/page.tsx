"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoritesButton } from "@/components/bookmarks/favorites-button";
import Link from "next/link";
import { InvestmentOffer } from "@/types";

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [offer, setOffer] = useState<InvestmentOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from Convex
    // For now, using mock data
    const fetchOffer = async () => {
      try {
        // Mock API call - replace with actual Convex query
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

        // Mock offer data
        const mockOffer: InvestmentOffer = {
          id: params.id as string,
          investorId: "investor1",
          title: "Tech-Focused Growth Capital",
          description: `Strategic investment fund focused on technology startups with proven market traction and scalable business models.

Investment Philosophy:
• Partner with exceptional entrepreneurs building category-defining companies
• Focus on product-market fit and sustainable unit economics
• Support companies through growth challenges with strategic guidance
• Long-term partnership approach beyond just capital

Preferred sectors include SaaS, AI/ML, Fintech, Healthtech, and Enterprise Software. We look for founders with deep domain expertise and clear vision for market disruption.`,
          amountRange: { min: 250000, max: 2000000 },
          preferredEquity: { min: 10, max: 25 },
          preferredStages: ["early", "growth"],
          preferredIndustries: ["Technology", "SaaS", "AI/ML", "Fintech"],
          investmentType: "equity",
          timeline: "Looking to deploy capital within 6 months, flexible on timeline for exceptional opportunities",
          isActive: true,
          createdAt: Date.now() - 86400000 * 14, // 14 days ago
          updatedAt: Date.now() - 86400000 * 3, // 3 days ago
        };

        setOffer(mockOffer);
      } catch (err) {
        setError("Failed to load offer details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchOffer();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || "Offer not found"}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()}>
              ← Back to Offers
            </Button>
            <Badge variant={offer.isActive ? "default" : "secondary"}>
              {offer.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{offer.title}</CardTitle>
                <CardDescription className="text-lg">
                  Investment Type: <span className="font-medium text-gray-900 capitalize">{offer.investmentType}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">{offer.description}</p>

                {/* Investment Range */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Range</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(offer.amountRange.min)} - {formatCurrency(offer.amountRange.max)}
                    </p>
                    <p className="text-gray-600">Typical investment size</p>
                  </div>
                </div>

                {/* Equity Range */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Equity Range</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {offer.preferredEquity.min}% - {offer.preferredEquity.max}%
                    </p>
                    <p className="text-gray-600">Equity stake typically sought</p>
                  </div>
                </div>

                {/* Timeline */}
                {offer.timeline && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Investment Timeline</h3>
                    <p className="text-gray-700">{offer.timeline}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Preferred Business Stages</h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.preferredStages.map((stage) => (
                      <Badge key={stage} variant="outline" className="capitalize">
                        {stage}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Preferred Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.preferredIndustries.map((industry) => (
                      <Badge key={industry} variant="secondary">
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </div>

                {offer.geographicPreference && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Geographic Preference</h3>
                    <p className="text-gray-600">{offer.geographicPreference}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.userType === "creator" && (
                  <>
                    <FavoritesButton itemId={offer.id} itemType="offer" />
                    <Button className="w-full">Apply for Investment</Button>
                    <Button variant="outline" className="w-full">
                      Schedule Call
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Similar Offers
                    </Button>
                  </>
                )}

                {user?.userType === "investor" && offer.investorId === user.id && (
                  <>
                    <Link href={`/offers/${offer.id}/edit`}>
                      <Button className="w-full">Edit Offer</Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      View Applications
                    </Button>
                    <Button variant="outline" className="w-full">
                      Deactivate Offer
                    </Button>
                  </>
                )}

                {!user && (
                  <Link href="/auth/login">
                    <Button className="w-full">Sign In to Connect</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Offer Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Offer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={offer.isActive ? "default" : "secondary"}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="text-sm">{formatDate(offer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="text-sm">{formatDate(offer.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">7</span>
                </div>
              </CardContent>
            </Card>

            {/* Investor's Other Offers */}
            <Card>
              <CardHeader>
                <CardTitle>Investor's Other Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/offers/2" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <h4 className="font-medium text-sm">Healthcare Innovation Fund</h4>
                    <p className="text-xs text-gray-600">$100K - $500K • Healthcare</p>
                  </Link>
                  <Link href="/offers/3" className="block p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <h4 className="font-medium text-sm">Sustainable Energy Investment</h4>
                    <p className="text-xs text-gray-600">$75K - $300K • Clean Energy</p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-sm text-gray-600">Investment Manager</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}