"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import { EnhancedMatchCard, MatchStatistics, MatchFilter } from "@/components/matching/enhanced-match-card";
import { useEnhancedMatching } from "@/hooks/use-enhanced-matching";
import { useFavorites } from "@/hooks/use-favorites";
import type { MatchResult } from "@/lib/matching-algorithm";

export default function MatchesPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const supabase = createClient();

  // Enhanced matching system
  const {
    matches: enhancedMatches,
    isLoading: enhancedLoading,
    error: enhancedError,
    findMatches,
    getMatchStatistics,
    lastUpdated
  } = useEnhancedMatching();

  // Favorites system
  const { isItemFavorited, toggleFavorite } = useFavorites();

  // Filter state for enhanced matching
  const [matchFilters, setMatchFilters] = useState({
    minScore: 0,
    maxScore: 100,
    confidence: [] as string[],
    sortBy: 'score' as 'score' | 'recent' | 'confidence'
  });

  // Fetch matches from Supabase
  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await (supabase as any)
          .from('matches')
          .select('*')
          .or(`creator_id.eq.${user.id},investor_id.eq.${user.id}`);

        if (error) throw error;

        if (data) {
          setMatches(data);
          setFilteredMatches(data);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [user, supabase]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter((match: any) => match.status === statusFilter));
    }
  }, [matches, statusFilter]);

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to view your matches.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading your matches...</p>
          </div>
        </div>
      </SidebarLayout>
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

  // Enhanced match card handlers
  const handleEnhancedViewDetails = (match: MatchResult) => {
    // Navigate to the appropriate details page based on user type
    if (user?.userType === 'creator') {
      router.push(`/offers/${match.offer_id}`);
    } else {
      router.push(`/ideas/${match.idea_id}`);
    }
  };

  const handleEnhancedStartConversation = (match: MatchResult) => {
    // This will be enhanced when we implement the messaging system
    toast.info("Starting conversation...");
    router.push("/messages");
  };

  const handleEnhancedToggleFavorite = (match: MatchResult) => {
    // Favorite functionality is handled by the useFavorites hook
    toast.success("Favorite status updated");
  };

  const handleEnhancedShare = (match: MatchResult) => {
    toast.success("Match shared!");
  };

  // Match action handlers
  const handleAcceptMatch = async (matchId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('matches')
        .update({ status: 'contacted' })
        .eq('id', matchId);

      if (error) throw error;

      toast.success("Match accepted! Conversation created.");
      // Refresh the matches
      window.location.reload();
    } catch (error) {
      console.error("Error accepting match:", error);
      toast.error("Failed to accept match. Please try again.");
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;

      toast.success("Match rejected.");
      // Refresh the matches
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting match:", error);
      toast.error("Failed to reject match. Please try again.");
    }
  };

  const handleStartConversation = async (match: any) => {
    try {
      // Create or get conversation
      const { data: conversation, error } = await (supabase as any)
        .from('conversations')
        .select('*')
        .eq('match_id', match.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!conversation) {
        // Create new conversation
        const { error: createError } = await (supabase as any)
          .from('conversations')
          .insert([{
            match_id: match.id,
            participant1_id: match.creator_id,
            participant2_id: match.investor_id,
          }]);

        if (createError) throw createError;
      }

      // Update match status to contacted
      await (supabase as any)
        .from('matches')
        .update({ status: 'contacted' })
        .eq('id', match.id);

      toast.success("Conversation started!");
      // Navigate to messages page
      router.push("/messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
    }
  };

  const handleContinueDiscussion = (match: any) => {
    // Navigate to messages page - the conversation should already exist
    toast.info("Continuing discussion...");
    router.push("/messages");
  };

  return (
    <SidebarLayout>
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Matches</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Discover and manage your {user.userType === "creator" ? "investor matches" : "business idea matches"}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              {/* Enhanced matching refresh button */}
              <Button
                onClick={() => findMatches()}
                disabled={enhancedLoading}
                variant="outline"
                size="sm"
              >
                {enhancedLoading ? "Refreshing..." : "Refresh Matches"}
              </Button>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
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

          {/* Enhanced matching error display */}
          {enhancedError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">
                Error loading enhanced matches: {enhancedError}
              </p>
            </div>
          )}
        </div>

        {/* Enhanced Matching Section */}
        {enhancedMatches.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Enhanced Matches</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI-powered intelligent matching with real-time updates
                </p>
              </div>
              {lastUpdated && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Match Filters for Enhanced System */}
            <div className="mb-6">
              <MatchFilter
                filters={matchFilters}
                onFiltersChange={setMatchFilters}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Match Statistics */}
              <div className="xl:col-span-1">
                <MatchStatistics
                  statistics={{
                    totalMatches: enhancedMatches.length,
                    highConfidenceMatches: enhancedMatches.filter(m => m.confidence === 'high').length,
                    mediumConfidenceMatches: enhancedMatches.filter(m => m.confidence === 'medium').length,
                    averageScore: enhancedMatches.length > 0 ? enhancedMatches.reduce((sum, m) => sum + m.match_score, 0) / enhancedMatches.length : 0,
                    topFactors: [
                      { factor: 'industryAlignment', average: enhancedMatches.length > 0 ? enhancedMatches.reduce((sum, m) => sum + m.factors.industryAlignment, 0) / enhancedMatches.length : 0 },
                      { factor: 'amountCompatibility', average: enhancedMatches.length > 0 ? enhancedMatches.reduce((sum, m) => sum + m.factors.amountCompatibility, 0) / enhancedMatches.length : 0 },
                      { factor: 'stagePreference', average: enhancedMatches.length > 0 ? enhancedMatches.reduce((sum, m) => sum + m.factors.stagePreference, 0) / enhancedMatches.length : 0 },
                    ],
                    improvementSuggestions: enhancedMatches.length < 5 ? ["Complete your profile to get better matches", "Add more detailed preferences"] : [],
                  }}
                />
              </div>

              {/* Enhanced Match Cards */}
              <div className="xl:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enhancedMatches
                    .filter(match => {
                      const score = match.match_score * 100;
                      return score >= matchFilters.minScore && score <= matchFilters.maxScore &&
                             (matchFilters.confidence.length === 0 || matchFilters.confidence.includes(match.confidence));
                    })
                    .sort((a, b) => {
                      switch (matchFilters.sortBy) {
                        case 'score':
                          return b.match_score - a.match_score;
                        case 'recent':
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                        case 'confidence':
                          const confidenceOrder = { high: 3, medium: 2, low: 1 };
                          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
                        default:
                          return 0;
                      }
                    })
                    .map((match) => (
                      <EnhancedMatchCard
                        key={`${match.idea_id}-${match.offer_id}`}
                        match={match}
                        currentUserType={user?.userType || 'creator'}
                        onViewDetails={handleEnhancedViewDetails}
                        onStartConversation={handleEnhancedStartConversation}
                        onToggleFavorite={handleEnhancedToggleFavorite}
                        onShare={handleEnhancedShare}
                        isFavorite={isItemFavorited(match.idea_id) || isItemFavorited(match.offer_id)}
                        isRealTimeUpdating={!enhancedLoading}
                        lastUpdated={lastUpdated}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Matches Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">All Matches</h2>

        {filteredMatches.length === 0 ? (
           <div className="text-center py-12">
             <p className="text-gray-500 text-lg">
               {statusFilter === "all" ? "No matches yet" : `No ${statusFilter} matches`}
             </p>
             <p className="text-gray-400 mt-2">
               {user.userType === "creator"
                 ? "Complete your profile and submit business ideas to start getting matched with investors."
                 : "Complete your profile and create investment offers to start getting matched with business ideas."
               }
             </p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((match: any) => (
              <Card key={match.id} className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        Match #{match.id?.slice(-6) || 'Unknown'}
                      </CardTitle>
                      <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
                        Created on {formatDate(new Date(match.created_at).getTime())} • Last updated {formatDate(new Date(match.updated_at).getTime())}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {Math.round(match.match_score * 100)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Match Score</div>
                      </div>
                      <Badge variant={getStatusColor(match.status)} className="capitalize">
                        {match.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount Compatibility</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matching_factors.amountCompatibility}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry Alignment</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matching_factors.industryAlignment}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stage Preference</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matching_factors.stagePreference}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Alignment</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matching_factors.riskAlignment}%</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-3">
                      <Link href={`/ideas/${match.idea_id}`}>
                        <Button variant="outline" size="sm">View Idea</Button>
                      </Link>
                      {user.userType === "creator" ? (
                        <Link href={`/offers/${match.offer_id}`}>
                          <Button variant="outline" size="sm">View Offer</Button>
                        </Link>
                      ) : (
                        <Link href={`/ideas/${match.idea_id}`}>
                          <Button variant="outline" size="sm">View Idea</Button>
                        </Link>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {match.status === "suggested" && (
                        <>
                          <Button size="sm" onClick={() => handleAcceptMatch(match._id)}>Accept Match</Button>
                          <Button variant="outline" size="sm" onClick={() => handleRejectMatch(match._id)}>Reject</Button>
                        </>
                      )}
                      {match.status === "viewed" && (
                        <Button size="sm" onClick={() => handleStartConversation(match)}>Start Conversation</Button>
                      )}
                      {(match.status === "contacted" || match.status === "negotiating") && (
                        <Button size="sm" onClick={() => handleContinueDiscussion(match._id)}>Continue Discussion</Button>
                      )}
                      {match.status === "invested" && (
                        <Badge className="bg-green-900/20 text-green-400">Investment Made</Badge>
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
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {matches.filter((m: any) => m.status === "suggested").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Suggested</div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {matches.filter((m: any) => m.status === "contacted" || m.status === "negotiating").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {matches.filter((m: any) => m.status === "invested").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Invested</div>
              </CardContent>
            </Card>
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-400">
                  {matches.length > 0 ? Math.round(matches.reduce((acc: number, m: any) => acc + (m.match_score * 100), 0) / matches.length) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Avg Score</div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
        </div>
      </div>
     </SidebarLayout>
   );
 }
