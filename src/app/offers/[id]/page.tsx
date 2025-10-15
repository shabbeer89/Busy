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
    const fetchOffer = async () => {
      if (!params.id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch real offer data from API
        const response = await fetch(`/api/offers/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch offer');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.error || 'Offer not found');
        }

        setOffer(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load offer details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffer();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-300 mb-4">{error || "Offer not found"}</p>
          <Button onClick={() => router.back()} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Go Back</Button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              ← Back to Offers
            </Button>
            <Badge variant={offer.isActive ? "default" : "secondary"} className={offer.isActive ? "bg-green-600 hover:bg-green-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"}>
              {offer.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-3xl text-white">{offer.title}</CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Investment Type: <span className="font-medium text-white capitalize">{offer.investmentType}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed mb-6">{offer.description}</p>

                {/* Investment Range */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Investment Range</h3>
                  <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 p-4 rounded-lg border border-green-500/20 hover:border-green-400/30 transition-all duration-300">
                    <p className="text-2xl font-bold text-green-400">
                      {offer.amountRange ? `${formatCurrency(offer.amountRange.min)} - ${formatCurrency(offer.amountRange.max)}` : "Range not specified"}
                    </p>
                    <p className="text-green-300/80">Typical investment size</p>
                  </div>
                </div>

                {/* Equity Range */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Equity Range</h3>
                  <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 p-4 rounded-lg border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                    <p className="text-2xl font-bold text-blue-400">
                      {offer.preferredEquity ? `${offer.preferredEquity.min}% - ${offer.preferredEquity.max}%` : "Equity not specified"}
                    </p>
                    <p className="text-blue-300/80">Equity stake typically sought</p>
                  </div>
                </div>

                {/* Timeline */}
                {offer.timeline && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Investment Timeline</h3>
                    <p className="text-slate-300">{offer.timeline}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Preferences */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Investment Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Preferred Business Stages</h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.preferredStages && offer.preferredStages.length > 0 ? (
                      offer.preferredStages.map((stage) => (
                        <Badge key={stage} variant="outline" className="capitalize border-slate-500 text-slate-300 hover:bg-slate-700">
                          {stage}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No specific stages preferred</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Preferred Industries</h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.preferredIndustries && offer.preferredIndustries.length > 0 ? (
                      offer.preferredIndustries.map((industry) => (
                        <Badge key={industry} variant="secondary" className="bg-slate-700 border-slate-600 text-slate-300">
                          {industry}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-slate-400 text-sm">No specific industries specified</p>
                    )}
                  </div>
                </div>

                {offer.geographicPreference && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Geographic Preference</h3>
                    <p className="text-slate-400">{offer.geographicPreference}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Take Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user?.userType === "creator" && (
                  <>
                    <FavoritesButton itemId={offer.id} itemType="offer" />
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Apply for Investment</Button>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      Schedule Call
                    </Button>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      View Similar Offers
                    </Button>
                  </>
                )}

                {user?.userType === "investor" && offer.investorId === user.id && (
                  <>
                    <Link href={`/offers/${offer.id}/edit`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Edit Offer</Button>
                    </Link>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      View Applications
                    </Button>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      Deactivate Offer
                    </Button>
                  </>
                )}

                {!user && (
                  <Link href="/auth/login">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Sign In to Connect</Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Offer Stats */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Offer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge variant={offer.isActive ? "default" : "secondary"} className={offer.isActive ? "bg-green-600 hover:bg-green-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Posted:</span>
                  <span className="text-sm text-slate-300">{formatDate(offer.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Updated:</span>
                  <span className="text-sm text-slate-300">{formatDate(offer.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Views:</span>
                  <span className="font-medium text-white">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Applications:</span>
                  <span className="font-medium text-white">7</span>
                </div>
              </CardContent>
            </Card>

            {/* Investor's Other Offers */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Investor's Other Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/offers/2" className="block p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700">
                    <h4 className="font-medium text-sm text-white">Healthcare Innovation Fund</h4>
                    <p className="text-xs text-slate-400">$100K - $500K • Healthcare</p>
                  </Link>
                  <Link href="/offers/3" className="block p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700">
                    <h4 className="font-medium text-sm text-white">Sustainable Energy Investment</h4>
                    <p className="text-xs text-slate-400">$75K - $300K • Clean Energy</p>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-900/20 rounded-full flex items-center justify-center border border-blue-500/30">
                    <span className="text-blue-400 font-semibold">JD</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">Jane Doe</p>
                    <p className="text-sm text-slate-400">Investment Manager</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
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