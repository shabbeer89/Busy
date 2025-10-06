"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/components/bookmarks/favorites-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { SidebarLayout } from "@/components/navigation/sidebar";

interface FavoriteOffer {
  id: string;
  title: string;
  description: string;
  amountRange: { min: number; max: number };
  preferredEquity: { min: number; max: number };
  preferredStages: string[];
  preferredIndustries: string[];
  investmentType: string;
  isActive: boolean;
  createdAt: number;
}

interface FavoriteIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  equityOffered: number;
  stage: string;
  status: string;
  createdAt: number;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favoritedOffers, favoritedIdeas, removeFromFavorites, isLoading } = useFavorites();

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to view your favorites.</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading favorites...</p>
          </div>
        </div>
      </SidebarLayout>
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

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  const handleRemoveFavorite = async (itemId: string, itemType: "offer" | "idea") => {
    try {
      await removeFromFavorites(itemId, itemType);
      // The UI will automatically update via Convex real-time subscriptions
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  return (
          <SidebarLayout>
    
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Your saved investment offers and business ideas
              </p>
            </div>
          </div>
        </div>

        {(favoritedOffers.length + favoritedIdeas.length) === 0 ? (
          <Card className="bg-slate-800 dark:bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start browsing offers and ideas to save your favorites for later.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/offers">
                  <Button>Browse Offers</Button>
                </Link>
                <Link href="/ideas">
                  <Button variant="outline">Browse Ideas</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="offers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="offers">
                Investment Offers ({favoritedOffers.length})
              </TabsTrigger>
              <TabsTrigger value="ideas">
                Business Ideas ({favoritedIdeas.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="offers" className="space-y-6">
              {favoritedOffers.length === 0 ? (
                <Card className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-300">No favorited offers yet</p>
                    <Link href="/offers">
                      <Button className="mt-4">Browse Offers</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {favoritedOffers.map((offer: any) => (
                    <Card key={offer._id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-white">{offer.title}</CardTitle>
                            <CardDescription className="mt-2 text-slate-300">
                              Added {formatTimeAgo(offer.favoritedAt)}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFavorite(offer._id, "offer")}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-4">{offer.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-400">Investment Range</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(offer.amountRange.min)} - {formatCurrency(offer.amountRange.max)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-400">Preferred Industries</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {offer.preferredIndustries.slice(0, 3).map((industry: string) => (
                                <Badge key={industry} variant="outline" className="text-xs">
                                  {industry}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6">
              {favoritedIdeas.length === 0 ? (
                <Card className="bg-slate-800 dark:bg-slate-800 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-300">No favorited ideas yet</p>
                    <Link href="/ideas">
                      <Button className="mt-4">Browse Ideas</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {favoritedIdeas.map((idea: any) => (
                    <Card key={idea._id} className="bg-slate-800 border-slate-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-white">{idea.title}</CardTitle>
                            <CardDescription className="mt-2 text-slate-300">
                              Added {formatTimeAgo(idea.favoritedAt)}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveFavorite(idea._id, "idea")}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-300 mb-4">{idea.description}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-400">Funding Goal</p>
                            <p className="text-lg font-semibold text-white">
                              {formatCurrency(idea.fundingGoal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-400">Stage</p>
                            <Badge variant="outline" className="capitalize">
                              {idea.stage}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
          </SidebarLayout>
  );
}