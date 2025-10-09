"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  User,
  TrendingUp,
  Clock,
  Lightbulb,
  DollarSign,
  Target,
  Activity,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CheckCircle,
  AlertCircle,
  Zap,
  Award,
  Calendar,
  MessageSquare,
  Eye
} from "lucide-react";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";
import { CardSkeleton, ProfileSkeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/lib/convex";
import { Id } from "../../../convex/_generated/dataModel";

// Helper function to properly convert string to Convex ID
const stringToConvexId = (id: string): Id<"users"> => {
  return id as Id<"users">;
};

interface DashboardStats {
  totalMatches: number;
  activeOffers: number;
  totalEarnings: number;
  profileViews: number;
  responseRate: number;
  successRate: number;
  recentActivity: Array<{
    id: string;
    type: 'match' | 'view' | 'message' | 'investment';
    title: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

export default function DashboardPage() {
  const { user, hasValidConvexId } = useAuth();
  const { profileStatus } = useProfile();
  const [convexUserId, setConvexUserId] = useState<Id<"users"> | null>(null);

  // For OAuth users, we need to ensure they have a Convex user record first
  const findOrCreateUserMutation = useMutation(api.users.findOrCreateUserByOAuth);

  // Handle user creation and get Convex user ID
  useEffect(() => {
    const setupUser = async () => {
      if (!user) {
        setConvexUserId(null);
        return;
      }

      console.log("Setting up user:", user.id, "hasValidConvexId:", hasValidConvexId(user.id));
      console.log("User provider:", (user as any).provider);

      // Always use findOrCreateUserMutation for all users to ensure proper Convex ID
      if (user.email) {
        try {
          console.log("Creating/finding Convex user:", user.id);
          const convexId = await findOrCreateUserMutation({
            oauthId: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            provider: (user as any).provider || "auth",
          });

          if (convexId) {
            console.log("Got Convex user ID:", convexId);
            setConvexUserId(stringToConvexId(convexId));
          } else {
            console.error("No Convex ID returned from findOrCreateUserByOAuth");
          }
        } catch (error) {
          console.error("Error setting up user:", error);
        }
      }
    };

    setupUser();
  }, [user, findOrCreateUserMutation]);

  // Fetch dynamic dashboard data
  const dashboardStats = useQuery(
    api.analytics.getUserDashboardStats,
    convexUserId ? { userId: convexUserId } : "skip"
  );

  // Fetch platform-wide stats to sync with analytics page
  const platformStats = useQuery(api.analytics.getPlatformStats);

  const stats = dashboardStats || null;
  const isLoading = dashboardStats === undefined && user !== undefined;

  // Debug logging
  useEffect(() => {
    console.log("Dashboard Debug:", {
      user: user?.id,
      convexUserId,
      dashboardStats,
      platformStats,
      isLoading,
      hasValidConvexId: user ? hasValidConvexId(user.id) : false
    });
  }, [user, convexUserId, dashboardStats, platformStats, isLoading, hasValidConvexId]);

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to access your dashboard.</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProfileSkeleton />
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Target className="w-4 h-4 text-blue-400" />;
      case 'view':
        return <Eye className="w-4 h-4 text-green-400" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'investment':
        return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'bg-blue-900/20 border-blue-800 text-blue-400';
      case 'view':
        return 'bg-green-900/20 border-green-800 text-green-400';
      case 'message':
        return 'bg-purple-900/20 border-purple-800 text-purple-400';
      case 'investment':
        return 'bg-yellow-900/20 border-yellow-800 text-yellow-400';
      default:
        return 'bg-gray-900/20 border-gray-800 text-gray-400';
    }
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Personalized Welcome Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
            <div className="relative p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${user.isVerified ? 'bg-green-500' : 'bg-amber-500'}`}>
                      {user.isVerified ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      Welcome back, {user.name}!
                    </h1>
                    <p className="text-slate-300 text-lg mb-3">
                      Ready to {user.userType === 'creator' ? 'pitch your next big idea' : 'discover amazing opportunities'}?
                    </p>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="bg-white/10 text-white border-white/20 capitalize">
                        {user.userType}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{stats?.successRate}% Success Rate</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">{stats?.totalMatches || 0}</div>
                    <div className="text-sm text-slate-300">Total Matches</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-white mb-1">{stats?.profileViews || 0}</div>
                    <div className="text-sm text-slate-300">Profile Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-blue-400" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Total Matches</p>
                  <p className="text-3xl font-bold text-white mb-2">{stats?.totalMatches || 0}</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +12% from last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-white mb-2">{formatCurrency(stats?.totalEarnings || 0)}</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +8% from last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Response Rate</p>
                  <p className="text-3xl font-bold text-white mb-2">{stats?.responseRate || 0}%</p>
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" />
                    -3% from last month
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="w-6 h-6 text-yellow-400" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Profile Views</p>
                  <p className="text-3xl font-bold text-white mb-2">{stats?.profileViews || 0}</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    +24% from last month
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.userType === "creator" ? (
                  <>
                    <Link href="/ideas/create">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3">
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Business Idea
                      </Button>
                    </Link>
                    <Link href="/ideas">
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white py-3">
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Browse All Ideas
                      </Button>
                    </Link>
                    <Link href="/matches">
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white py-3">
                        <Target className="w-4 h-4 mr-2" />
                        My Matches
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/ideas">
                      <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3">
                        <Eye className="w-4 h-4 mr-2" />
                        Browse Business Ideas
                      </Button>
                    </Link>
                    <Link href="/offers/create">
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white py-3">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Investment Offer
                      </Button>
                    </Link>
                    <Link href="/matches">
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white py-3">
                        <Target className="w-4 h-4 mr-2" />
                        My Matches
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Award className="w-5 h-5 text-purple-400" />
                  Profile Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileStatus && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Completion</span>
                        <span className="text-sm text-slate-400">{profileStatus.percentage}%</span>
                      </div>
                      <Progress value={profileStatus.percentage} className="h-2 bg-slate-700" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.isVerified ? 'bg-green-900/20' : 'bg-amber-900/20'}`}>
                          <Clock className={`w-4 h-4 ${user.isVerified ? 'text-green-400' : 'text-amber-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Account Status</p>
                          <p className={`text-xs ${user.isVerified ? 'text-green-400' : 'text-amber-400'}`}>
                            {user.isVerified ? "Verified" : "Pending Verification"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600">
                        <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">Profile Info</p>
                          <p className="text-xs text-slate-400">
                            {user.bio || user.location ? "Complete" : "Incomplete"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link href="/profile">
                      <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                        {user.bio || user.location ? "Edit Profile" : "Complete Profile"}
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="w-5 h-5 text-green-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className={`p-3 rounded-lg border ${getActivityColor(activity.type)}`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                          <p className="text-xs text-slate-300 truncate">{activity.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">{activity.timestamp}</span>
                            {activity.amount && (
                              <span className="text-xs font-medium text-green-400">
                                {formatCurrency(activity.amount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/matches">
                  <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                    View All Activity
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Platform Overview */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Platform Overview
              </CardTitle>
              <CardDescription className="text-slate-400">
                Current platform statistics and your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{platformStats?.totalIdeas || 0}</div>
                  <div className="text-sm text-slate-400">Total Ideas</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-green-400 mb-1">{platformStats?.totalOffers || 0}</div>
                  <div className="text-sm text-slate-400">Active Offers</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{platformStats?.totalMatches || 0}</div>
                  <div className="text-sm text-slate-400">Total Matches</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-yellow-400 mb-1">${((platformStats?.totalFunding || 0) / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-slate-400">Total Funding</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Your Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Success Rate</span>
                        <span className="text-sm text-slate-400">{stats?.successRate}%</span>
                      </div>
                      <Progress value={stats?.successRate} className="h-2 bg-slate-700" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-300">Response Rate</span>
                        <span className="text-sm text-slate-400">{stats?.responseRate}%</span>
                      </div>
                      <Progress value={stats?.responseRate} className="h-2 bg-slate-700" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">Top Industries</h4>
                  <div className="space-y-2">
                    {platformStats?.topIndustries?.slice(0, 4).map((industry, index) => (
                      <div key={industry} className="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600">
                        <span className="text-sm text-slate-300">{industry}</span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                          #{index + 1}
                        </Badge>
                      </div>
                    )) || []}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}