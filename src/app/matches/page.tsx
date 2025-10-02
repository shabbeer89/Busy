"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Match } from "@/types";

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    // Mock data - in real app this would come from Convex queries
    const fetchMatches = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock matches data
        const mockMatches: Match[] = [
          {
            id: "1",
            ideaId: "idea1",
            investorId: "investor1",
            creatorId: "creator1",
            offerId: "offer1",
            matchScore: 87,
            matchingFactors: {
              amountCompatibility: 90,
              industryAlignment: 95,
              stagePreference: 80,
              riskAlignment: 85,
            },
            status: "suggested",
            createdAt: Date.now() - 86400000 * 2, // 2 days ago
            updatedAt: Date.now() - 86400000 * 1, // 1 day ago
          },
          {
            id: "2",
            ideaId: "idea2",
            investorId: "investor2",
            creatorId: "creator1",
            offerId: "offer2",
            matchScore: 92,
            matchingFactors: {
              amountCompatibility: 95,
              industryAlignment: 90,
              stagePreference: 95,
              riskAlignment: 90,
            },
            status: "viewed",
            createdAt: Date.now() - 86400000 * 5, // 5 days ago
            updatedAt: Date.now() - 86400000 * 3, // 3 days ago
          },
          {
            id: "3",
            ideaId: "idea3",
            investorId: "investor3",
            creatorId: "creator1",
            offerId: "offer3",
            matchScore: 78,
            matchingFactors: {
              amountCompatibility: 85,
              industryAlignment: 70,
              stagePreference: 85,
              riskAlignment: 75,
            },
            status: "contacted",
            createdAt: Date.now() - 86400000 * 7, // 7 days ago
            updatedAt: Date.now() - 86400000 * 4, // 4 days ago
          },
        ];

        setMatches(mockMatches);
        setFilteredMatches(mockMatches);
      } catch (error) {
        console.error("Failed to fetch matches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchMatches();
    }
  }, [user]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter(match => match.status === statusFilter));
    }
  }, [matches, statusFilter]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your matches.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your matches...</p>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "suggested": return "default";
      case "viewed": return "secondary";
      case "contacted": return "outline";
      case "negotiating": return "destructive";
      case "invested": return "default";
      case "rejected": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
              <p className="text-gray-600 mt-2">
                Discover and manage your {user.userType === "creator" ? "investor matches" : "business idea matches"}
              </p>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="suggested">Suggested</option>
                <option value="viewed">Viewed</option>
                <option value="contacted">Contacted</option>
                <option value="negotiating">Negotiating</option>
                <option value="invested">Invested</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === "all" ? "No matches yet" : `No ${statusFilter} matches`}
            </h2>
            <p className="text-gray-600 mb-6">
              {user.userType === "creator"
                ? "Complete your profile and submit business ideas to start getting matched with investors."
                : "Complete your profile and create investment offers to start getting matched with business ideas."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/profile">
                <Button>Complete Profile</Button>
              </Link>
              {user.userType === "creator" ? (
                <Link href="/ideas/create">
                  <Button variant="outline">Submit Business Idea</Button>
                </Link>
              ) : (
                <Link href="/offers/create">
                  <Button variant="outline">Create Investment Offer</Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredMatches.map((match) => (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        Match #{match.id.slice(-6)}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Created on {formatDate(match.createdAt)} • Last updated {formatDate(match.updatedAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {match.matchScore}%
                        </div>
                        <div className="text-sm text-gray-600">Match Score</div>
                      </div>
                      <Badge variant={getStatusColor(match.status)} className="capitalize">
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Amount Compatibility</p>
                      <p className="text-lg font-semibold">{match.matchingFactors.amountCompatibility}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Industry Alignment</p>
                      <p className="text-lg font-semibold">{match.matchingFactors.industryAlignment}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Stage Preference</p>
                      <p className="text-lg font-semibold">{match.matchingFactors.stagePreference}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Risk Alignment</p>
                      <p className="text-lg font-semibold">{match.matchingFactors.riskAlignment}%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <Link href={`/ideas/${match.ideaId}`}>
                        <Button variant="outline" size="sm">View Idea</Button>
                      </Link>
                      {user.userType === "creator" ? (
                        <Link href={`/offers/${match.offerId}`}>
                          <Button variant="outline" size="sm">View Offer</Button>
                        </Link>
                      ) : (
                        <Link href={`/ideas/${match.ideaId}`}>
                          <Button variant="outline" size="sm">View Idea</Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {match.status === "suggested" && (
                        <>
                          <Button size="sm">Accept Match</Button>
                          <Button variant="outline" size="sm">Reject</Button>
                        </>
                      )}
                      {match.status === "viewed" && (
                        <Button size="sm">Start Conversation</Button>
                      )}
                      {(match.status === "contacted" || match.status === "negotiating") && (
                        <Button size="sm">Continue Discussion</Button>
                      )}
                      {match.status === "invested" && (
                        <Badge className="bg-green-100 text-green-800">Investment Made</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredMatches.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {matches.filter(m => m.status === "suggested").length}
                </div>
                <div className="text-sm text-gray-600">Suggested</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {matches.filter(m => m.status === "contacted" || m.status === "negotiating").length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {matches.filter(m => m.status === "invested").length}
                </div>
                <div className="text-sm text-gray-600">Invested</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round(matches.reduce((acc, m) => acc + m.matchScore, 0) / matches.length)}%
                </div>
                <div className="text-sm text-gray-600">Avg Score</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}