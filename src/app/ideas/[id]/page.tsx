"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FavoritesButton } from "@/components/bookmarks/favorites-button";
import Link from "next/link";
import { BusinessIdea } from "@/types";

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from Convex
    // For now, using mock data
    const fetchIdea = async () => {
      try {
        // Mock API call - replace with actual Convex query
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

        // Mock idea data
        const mockIdea: BusinessIdea = {
          id: params.id as string,
          creatorId: "creator1",
          title: "AI-Powered Personal Finance Assistant",
          description: `Revolutionizing personal finance management with artificial intelligence. Our platform provides personalized financial advice, automated budgeting, investment recommendations, and real-time spending insights.

Key features include:
• Machine learning algorithms that analyze spending patterns
• Personalized investment portfolio recommendations
• Automated savings and budgeting tools
• Real-time fraud detection and alerts
• Integration with 1000+ financial institutions

We're seeking strategic partners who share our vision of democratizing financial advice and making sophisticated financial tools accessible to everyone.`,
          category: "Technology",
          tags: ["AI", "Fintech", "Personal Finance", "Machine Learning", "Mobile App"],
          fundingGoal: 500000,
          currentFunding: 50000,
          equityOffered: 15,
          valuation: 3000000,
          stage: "mvp",
          timeline: "12-18 months to reach profitability, 3 years to unicorn status",
          teamSize: 8,
          status: "published",
          createdAt: Date.now() - 86400000 * 7, // 7 days ago
          updatedAt: Date.now() - 86400000 * 2, // 2 days ago
        };

        setIdea(mockIdea);
      } catch (err) {
        setError("Failed to load idea details");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchIdea();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-300 mb-4">{error || "Idea not found"}</p>
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

  const fundingProgress = (idea.currentFunding / idea.fundingGoal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => router.back()} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
              ← Back to Ideas
            </Button>
            <Badge variant="outline" className="capitalize border-slate-500 text-slate-300 hover:bg-slate-700">
              {idea.stage} Stage
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-3xl text-white">{idea.title}</CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Category: <span className="font-medium text-white">{idea.category}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed mb-6">{idea.description}</p>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {idea.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-slate-700 border-slate-600 text-slate-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Team Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Team Size</h3>
                    <p className="text-lg font-semibold text-white">{idea.teamSize} people</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Timeline</h3>
                    <p className="text-slate-400">{idea.timeline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Funding Information */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Funding Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Funding Progress</span>
                    <span className="text-sm text-slate-400">
                      {formatCurrency(idea.currentFunding)} of {formatCurrency(idea.fundingGoal)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {fundingProgress.toFixed(1)}% funded
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-400">Funding Goal</p>
                    <p className="text-xl font-bold text-white">{formatCurrency(idea.fundingGoal)}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-400">Equity Offered</p>
                    <p className="text-xl font-bold text-white">{idea.equityOffered}%</p>
                  </div>
                  {idea.valuation && (
                    <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                      <p className="text-sm text-slate-400">Pre-money Valuation</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(idea.valuation)}</p>
                    </div>
                  )}
                </div>
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
                {user?.userType === "investor" && (
                  <>
                    <FavoritesButton itemId={idea.id} itemType="idea" />
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Express Interest</Button>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      Request Meeting
                    </Button>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      View Similar Ideas
                    </Button>
                  </>
                )}

                {user?.userType === "creator" && idea.creatorId === user.id && (
                  <>
                    <Link href={`/ideas/${idea.id}/edit`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Edit Idea</Button>
                    </Link>
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                      View Applications
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

            {/* Idea Stats */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge variant="outline" className="capitalize border-slate-500 text-slate-300 hover:bg-slate-700">
                    {idea.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Posted:</span>
                  <span className="text-sm text-slate-300">{formatDate(idea.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Updated:</span>
                  <span className="text-sm text-slate-300">{formatDate(idea.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Views:</span>
                  <span className="font-medium text-white">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interests:</span>
                  <span className="font-medium text-white">12</span>
                </div>
              </CardContent>
            </Card>

            {/* Similar Ideas */}
            <Card className="bg-slate-800/60 border-slate-600 hover:bg-slate-800/80 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white">Similar Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/ideas/2" className="block p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700">
                    <h4 className="font-medium text-sm text-white">Blockchain-based Supply Chain</h4>
                    <p className="text-xs text-slate-400">Technology • Early Stage</p>
                  </Link>
                  <Link href="/ideas/3" className="block p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700">
                    <h4 className="font-medium text-sm text-white">Sustainable Fashion Platform</h4>
                    <p className="text-xs text-slate-400">E-commerce • MVP</p>
                  </Link>
                  <Link href="/ideas/4" className="block p-3 hover:bg-slate-800/50 rounded-lg transition-colors border border-slate-700">
                    <h4 className="font-medium text-sm text-white">Telemedicine for Rural Areas</h4>
                    <p className="text-xs text-slate-400">Healthcare • Growth</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
