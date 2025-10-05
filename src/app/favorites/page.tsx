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
  const { favorites, isLoading, removeFromFavorites } = useFavorites();
  const [favoriteOffers, setFavoriteOffers] = useState<FavoriteOffer[]>([]);
  const [favoriteIdeas, setFavoriteIdeas] = useState<FavoriteIdea[]>([]);

  useEffect(() => {
    // Mock data for favorited items
    if (favorites.length > 0) {
      const offers: FavoriteOffer[] = [
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
          createdAt: Date.now() - 86400000,
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
          createdAt: Date.now() - 259200000,
        },
      ];

      const ideas: FavoriteIdea[] = [
        {
          id: "idea1",
          title: "AI-Powered Personal Finance Assistant",
          description: "Revolutionizing personal finance management with artificial intelligence.",
          category: "Technology",
          tags: ["AI", "Fintech", "Personal Finance"],
          fundingGoal: 500000,
          equityOffered: 15,
          stage: "mvp",
          status: "published",
          createdAt: Date.now() - 86400000 * 7,
        },
      ];

      setFavoriteOffers(offers);
      setFavoriteIdeas(ideas);
    }
  }, [favorites]);

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
      // Update local state
      if (itemType === "offer") {
        setFavoriteOffers(prev => prev.filter(offer => offer.id !== itemId));
      } else {
        setFavoriteIdeas(prev => prev.filter(idea => idea.id !== itemId));
      }
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

        {favorites.length === 0 ? (
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
                Investment Offers ({favoriteOffers.length})
              </TabsTrigger>
              <TabsTrigger value="ideas">
                Business Ideas ({favoriteIdeas.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="offers" className="space-y-6">
              {favoriteOffers.length === 0 ? (
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
                  {favoriteOffers.map((offer) => (
                    <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                              <Heart className="w-5 h-5 text-red-500 fill-current" />
                              {offer.title}
                            </CardTitle>
                            <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
                              {offer.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={offer.isActive ? "default" : "secondary"}>
                              {offer.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite(offer.id, "offer")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Range</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(offer.amountRange.min)} - {formatCurrency(offer.amountRange.max)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Equity Range</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {offer.preferredEquity.min}% - {offer.preferredEquity.max}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{offer.investmentType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Saved</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{formatTimeAgo(Date.now())}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Link href={`/offers/${offer.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ideas" className="space-y-6">
              {favoriteIdeas.length === 0 ? (
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
                  {favoriteIdeas.map((idea) => (
                    <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white">
                              <Heart className="w-5 h-5 text-red-500 fill-current" />
                              {idea.title}
                            </CardTitle>
                            <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
                              {idea.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {idea.stage}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFavorite(idea.id, "idea")}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Funding Goal</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(idea.fundingGoal)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Equity Offered</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {idea.equityOffered}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{idea.category}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
                            <Badge variant="outline" className="capitalize text-gray-600 dark:text-gray-300 border-slate-600">
                              {idea.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Link href={`/ideas/${idea.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
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