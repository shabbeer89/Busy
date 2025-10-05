"use client";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Briefcase, User, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { SidebarLayout } from "@/components/navigation/sidebar";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profileStatus } = useProfile();

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

  return (
    <SidebarLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to your Dashboard, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Account Type: <span className="capitalize font-medium text-gray-900 dark:text-white">{user.userType}</span>
          </p>

          {profileStatus && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Profile Completion</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{profileStatus.percentage}%</span>
                </div>
                <Progress value={profileStatus.percentage} className="mb-2" />
                {!profileStatus.isComplete && (
                  <p className="text-sm text-amber-400 mt-2">
                    Complete your profile to get better matches
                  </p>
                )}
              </CardContent>
            </Card>)}
          </div>

          {/* Recent Activity */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
              {user.userType === "creator" ? (
                <>
                  <Link href="/ideas/create">
                    <Button className="w-full">Submit Business Idea</Button>
                  </Link>
                  <Link href="/ideas">
                    <Button variant="outline" className="w-full">Browse All Ideas</Button>
                  </Link>
                  <Link href="/matches">
                    <Button variant="outline" className="w-full">My Matches</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/ideas">
                    <Button className="w-full">Browse Business Ideas</Button>
                  </Link>
                  <Link href="/offers/create">
                    <Button variant="outline" className="w-full">Create Investment Offer</Button>
                  </Link>
                  <Link href="/matches">
                    <Button variant="outline" className="w-full">My Matches</Button>
                  </Link>
                </>
              )}
            </div>
            </CardContent>
          </Card>
        </div>
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-900/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Email</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-900/20 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Account Type</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{user.userType}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.isVerified ? 'bg-green-900/20' : 'bg-amber-900/20'}`}>
                      <Clock className={`w-4 h-4 ${user.isVerified ? 'text-green-400' : 'text-amber-400'}`} />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Status</span>
                  </div>
                  <span className={`text-sm font-medium ${user.isVerified ? 'text-green-400' : 'text-amber-400'}`}>
                    {user.isVerified ? "Verified" : "Pending Verification"}
                  </span>
                </div>
              <Link href="/profile">
                <Button variant="outline" className="w-full mt-4">
                  {user.bio || user.location ? "Edit Profile" : "Complete Profile"}
                </Button>
              </Link>
            </div>
            </CardContent>
          </Card>
          

          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Ideas</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Active Investors</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">567</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Matches Today</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">89</span>
                </div>
              <Link href="/matches">
                <Button variant="outline" className="w-full mt-4">
                  View Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recent Activity</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {user.userType === "creator"
                  ? "Submit your first business idea to get started!"
                  : "Create your first investment offer to begin matching with ideas!"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}