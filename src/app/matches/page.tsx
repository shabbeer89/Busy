"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/convex";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { EnhancedMatchCard, MatchStatistics, MatchFilter } from "@/components/matching/enhanced-match-card";
import { useEnhancedMatching } from "@/hooks/use-enhanced-matching";
import { useFavorites } from "@/hooks/use-favorites";
import type { MatchResult } from "@/lib/matching-algorithm";

export default function MatchesPage() {
  const { user, signOut, hasValidConvexId } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [convexUserId, setConvexUserId] = useState<string | null>(null);

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

  // Check for fake IDs and force logout if detected
  useEffect(() => {
    if (user && !hasValidConvexId(user.id)) {
      console.log("Fake ID detected, forcing logout");
      signOut();
      // Clear local storage to force fresh login
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    }
  }, [user, hasValidConvexId, signOut]);


  // Convex IDs are now properly typed in the User object

  // Get matches based on user type - only query when we have a valid Convex user ID
  const rawCreatorMatches = useQuery(
    api.matches.getMatchesByCreator,
    user?.userType === "creator" && convexUserId && convexUserId !== user?.id
      ? { userId: convexUserId as any }
      : "skip"
  );

  const rawInvestorMatches = useQuery(
    api.matches.getMatchesByInvestor,
    user?.userType === "investor" && convexUserId && convexUserId !== user?.id
      ? { investorId: convexUserId as any }
      : "skip"
  );

  // Convex mutations for OAuth user handling
  const findOrCreateUserMutation = useMutation(api.users.findOrCreateUserByOAuth);

  // Convex mutations for match actions
  const updateMatchStatusMutation = useMutation(api.matches.updateMatchStatus);
  const getOrCreateConversationMutation = useMutation(api.messages.getOrCreateConversation);

  // Memoize matches to prevent unnecessary re-renders
  const creatorMatches = useMemo(() => rawCreatorMatches || [], [rawCreatorMatches]);
  const investorMatches = useMemo(() => rawInvestorMatches || [], [rawInvestorMatches]);

  // Find the other user ID for a match (the person we're matched with)
  const getOtherUserId = (match: any) => {
    if (user?.userType === "creator") {
      return match.investorId;
    } else {
      return match.creatorId;
    }
  };

  // Handle match status updates and create conversations
  const handleAcceptMatch = async (matchId: string) => {
    if (!convexUserId) return;

    try {
      await updateMatchStatusMutation({ matchId: matchId as Id<"matches">, status: "contacted" });
      toast.success("Match accepted! Conversation created.");
      // Refresh the matches
      window.location.reload();
    } catch (error) {
      console.error("Error accepting match:", error);
      toast.error("Failed to accept match. Please try again.");
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!convexUserId) return;

    try {
      await updateMatchStatusMutation({ matchId: matchId as Id<"matches">, status: "rejected" });
      toast.success("Match rejected.");
      // Refresh the matches
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting match:", error);
      toast.error("Failed to reject match. Please try again.");
    }
  };

  const handleStartConversation = async (match: any) => {
    if (!convexUserId) return;

    try {
      const otherUserId = getOtherUserId(match);
      const conversation = await getOrCreateConversationMutation({
        matchId: match._id,
        participant1Id: convexUserId as Id<"users">,
        participant2Id: otherUserId as Id<"users">,
      });

      await updateMatchStatusMutation({ matchId: match._id, status: "contacted" });

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

  // Handle OAuth user creation and get Convex user ID
  useEffect(() => {
    const setupUser = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log("Matches setupUser - user:", user.id, "hasValidConvexId:", hasValidConvexId(user.id));
      console.log("User provider:", (user as any).provider);

      // If user has a valid Convex ID, use it directly
      if (hasValidConvexId(user.id)) {
        console.log("Using direct Convex ID:", user.id);
        setConvexUserId(user.id);
        setIsLoading(false);
        return;
      }

      // For OAuth users, create/find Convex user record
      if (user.email) {
        try {
          console.log("Creating/finding Convex user for matches:", user.id);
          const convexId = await findOrCreateUserMutation({
            oauthId: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            provider: (user as any).provider || "auth",
          });

          if (convexId) {
            console.log("Got Convex user ID for matches:", convexId);
            setConvexUserId(convexId);
            setIsLoading(false);
          } else {
            console.error("No Convex ID returned from findOrCreateUserByOAuth for matches");
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error setting up OAuth user for matches:", error);
          setIsLoading(false);
        }
      } else {
        console.log("No email found for user, setting loading to false");
        setIsLoading(false);
      }
    };

    setupUser();
  }, [user, hasValidConvexId, findOrCreateUserMutation]);

  // Convert Convex matches to component format
  useEffect(() => {
    const matchesData = user?.userType === "creator" ? creatorMatches : investorMatches;

    if (matchesData && matchesData.length > 0) {
      setMatches(matchesData);
      setFilteredMatches(matchesData);
      setIsLoading(false);
    } else if (matchesData !== undefined && convexUserId) {
      // No matches found for current user

      // In development mode, show sample matches for UI testing if user has no matches
      if (process.env.NODE_ENV === 'development' && matchesData.length === 0) {
        console.log("No matches found for current user, showing sample data for UI testing");
        // Use the first few matches from the database as sample data for UI testing
        const sampleMatches = [
          {
            _id: 'sample-match-1',
            matchScore: 89,
            status: 'suggested' as const,
            createdAt: Date.now() - 86400000, // 1 day ago
            updatedAt: Date.now() - 86400000,
            matchingFactors: {
              amountCompatibility: 95,
              industryAlignment: 92,
              stagePreference: 85,
              riskAlignment: 88,
            },
            ideaId: 'sample-idea-1',
            offerId: 'sample-offer-1',
            investorId: 'sample-investor-1',
            creatorId: 'sample-creator-1'
          },
          {
            _id: 'sample-match-2',
            matchScore: 76,
            status: 'viewed' as const,
            createdAt: Date.now() - 172800000, // 2 days ago
            updatedAt: Date.now() - 172800000,
            matchingFactors: {
              amountCompatibility: 82,
              industryAlignment: 85,
              stagePreference: 70,
              riskAlignment: 75,
            },
            ideaId: 'sample-idea-2',
            offerId: 'sample-offer-2',
            investorId: 'sample-investor-2',
            creatorId: 'sample-creator-2'
          }
        ];
        setMatches(sampleMatches);
        setFilteredMatches(sampleMatches);
      } else {
        setMatches([]);
        setFilteredMatches([]);
      }
      setIsLoading(false);
    }
  }, [creatorMatches, investorMatches, user, convexUserId]);

  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredMatches(matches);
    } else {
      setFilteredMatches(matches.filter((match: any) => match.status === statusFilter));
    }
  }, [matches, statusFilter]);

  // Debug user state
  console.log("Matches page render:", {
    user: user?.id,
    hasValidConvexId: user ? hasValidConvexId(user.id) : false,
    convexUserId,
    isLoading,
    userType: user?.userType,
    creatorMatchesCount: creatorMatches.length,
    investorMatchesCount: investorMatches.length
  });

  if (!user || !hasValidConvexId(user.id)) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {!hasValidConvexId(user?.id) ? "Account Setup Required" : "Access Denied"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {!hasValidConvexId(user?.id)
                ? "Your account needs to be updated. Please sign out and sign in again to get a proper account ID."
                : "Please sign in to view your matches."
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button>
                  {!hasValidConvexId(user?.id) ? "Sign Up" : "Sign In"}
                </Button>
              </Link>
              {user && !hasValidConvexId(user.id) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Force sign out to clear fake ID
                    window.location.href = "/auth/login";
                  }}
                >
                  Sign Out & Fix Account
                </Button>
              )}
            </div>
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
             {/* Debug info for development */}
             {process.env.NODE_ENV === 'development' && (
               <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                 <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
                 <div className="text-sm space-y-1">
                   <p>User ID: {user?.id}</p>
                   <p>Convex User ID: {convexUserId}</p>
                   <p>User Type: {user?.userType}</p>
                   <p>Has Valid Convex ID: {user ? hasValidConvexId(user.id).toString() : 'false'}</p>
                   <p>Raw Creator Matches: {creatorMatches.length}</p>
                   <p>Raw Investor Matches: {investorMatches.length}</p>
                   <p>Total Matches: {matches.length}</p>
                   <p>Status Filter: {statusFilter}</p>
                 </div>
                 {convexUserId && (
                   <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                     <p className="text-sm text-blue-800 dark:text-blue-200">
                       💡 Try signing in with one of these test accounts that have matches:
                     </p>
                     <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                       Creator: vignesh.kumar@email.com<br/>
                       Creator: meera.srinivasan@email.com<br/>
                       Investor: arjun.iyer@email.com
                     </p>
                   </div>
                 )}
               </div>
             )}

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
              <Card key={match._id} className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-slate-800 dark:border-slate-700`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-900 dark:text-white">
                        Match #{match._id?.slice(-6) || 'Unknown'}
                      </CardTitle>
                      <CardDescription className="mt-2 text-gray-600 dark:text-gray-300">
                        Created on {formatDate(match.createdAt)} • Last updated {formatDate(match.updatedAt)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">
                          {match.matchScore}%
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
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matchingFactors.amountCompatibility}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry Alignment</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matchingFactors.industryAlignment}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Stage Preference</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matchingFactors.stagePreference}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Alignment</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{match.matchingFactors.riskAlignment}%</p>
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
                  {matches.length > 0 ? Math.round(matches.reduce((acc: number, m: any) => acc + m.matchScore, 0) / matches.length) : 0}%
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
