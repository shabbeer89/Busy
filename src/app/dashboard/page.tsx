"use client";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
            <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">Please sign in to access your dashboard.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to your Dashboard, {user.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Account Type: <span className="capitalize font-medium text-foreground">{user.userType}</span>
          </p>

          {profileStatus && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Profile Completion</span>
                  <span className="text-sm text-muted-foreground">{profileStatus.percentage}%</span>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Email:</span> {user.email}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Account Type:</span> {user.userType}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Status:</span>{" "}
                  {user.isVerified ? "Verified" : "Pending Verification"}
                </p>
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Ideas:</span>
                  <span className="font-medium text-foreground">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Investors:</span>
                  <span className="font-medium text-foreground">567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Matches Today:</span>
                  <span className="font-medium text-foreground">89</span>
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
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-2">
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