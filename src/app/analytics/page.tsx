"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, AnimatedCard } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";

interface PlatformStats {
  totalUsers: number;
  totalCreators: number;
  totalInvestors: number;
  totalIdeas: number;
  totalOffers: number;
  totalMatches: number;
  totalInvestments: number;
  totalFunding: number;
  averageMatchScore: number;
  topIndustries: string[];
  recentActivity: {
    newIdeas: number;
    newOffers: number;
    newMatches: number;
    newInvestments: number;
  };
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");

  // Using static/mock data for now since this is a Supabase project
  // TODO: Replace with actual Supabase queries when database schema is ready
  const isLoading = false;
  const stats: PlatformStats = {
    totalUsers: 1247,
    totalCreators: 892,
    totalInvestors: 355,
    totalIdeas: 456,
    totalOffers: 123,
    totalMatches: 89,
    totalInvestments: 34,
    totalFunding: 2840000,
    averageMatchScore: 78,
    topIndustries: ["Technology", "Healthcare", "Finance", "E-commerce", "Education"],
    recentActivity: {
      newIdeas: 23,
      newOffers: 8,
      newMatches: 12,
      newInvestments: 3,
    },
  };

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please sign in to view analytics.</p>
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
            <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!stats) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-300">Failed to load analytics data.</p>
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
          <SidebarLayout>
    
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Insights and statistics for the BusinessMatch platform
              </p>
            </div>
            <div className="flex gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalUsers)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Ideas</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalIdeas)}</p>
                </div>
                <div className="w-12 h-12 bg-green-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatedCard className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Offers</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.totalOffers)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Funding</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalFunding)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Distribution */}
          <AnimatedCard>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown of creators vs investors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Creators</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatNumber(stats.totalCreators)} ({Math.round((stats.totalCreators / stats.totalUsers) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${(stats.totalCreators / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Investors</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatNumber(stats.totalInvestors)} ({Math.round((stats.totalInvestors / stats.totalUsers) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${(stats.totalInvestors / stats.totalUsers) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          {/* Top Industries */}
          <Card className="">
            <CardHeader>
              <CardTitle>Top Industries</CardTitle>
              <CardDescription>Most popular business categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.topIndustries?.map((industry, index) => (
                  <div key={industry} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-700 dark:bg-slate-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-300 dark:text-gray-300">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{industry}</span>
                    </div>
                    <Badge variant="outline">
                      {Math.floor(Math.random() * 500) + 100} ideas
                    </Badge>
                  </div>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <Card className="">
            <CardHeader>
              <CardTitle>Recent Activity ({timeRange})</CardTitle>
              <CardDescription>Platform activity in the selected time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-900/10 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">New Ideas</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">+{stats.recentActivity.newIdeas}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-900/10 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">New Offers</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">+{stats.recentActivity.newOffers}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-900/10 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">New Matches</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">+{stats.recentActivity.newMatches}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-900/10 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Investments</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">+{stats.recentActivity.newInvestments}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card className="">
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Match Success Rate</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {stats ? Math.floor((stats.totalInvestments / Math.max(stats.totalMatches, 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full"
                    style={{ width: `${stats ? Math.floor((stats.totalInvestments / Math.max(stats.totalMatches, 1)) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Average Match Score</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{stats?.averageMatchScore || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${stats?.averageMatchScore || 0}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">User Engagement</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {stats ? Math.floor((stats.totalMatches / Math.max(stats.totalUsers, 1)) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full"
                    style={{ width: `${stats ? Math.floor((stats.totalMatches / Math.max(stats.totalUsers, 1)) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">4.8</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">2.3M</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Page Views</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Growth Trends */}
        <Card className="">
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>Platform growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-900/10 to-blue-800/20 dark:from-blue-900/20 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">+23%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">User Growth</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-900/10 to-green-800/20 dark:from-green-900/20 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">+31%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Ideas Submitted</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-900/10 to-purple-800/20 dark:from-purple-900/20 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">+18%</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Match Rate</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </SidebarLayout>
  );
}