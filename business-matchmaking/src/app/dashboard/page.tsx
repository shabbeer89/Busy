"use client";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { profileStatus } = useProfile();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to your Dashboard, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Account Type: <span className="capitalize font-medium">{user.userType}</span>
          </p>

          {profileStatus && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm text-gray-600">{profileStatus.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileStatus.percentage}%` }}
                />
              </div>
              {!profileStatus.isComplete && (
                <p className="text-sm text-amber-600 mt-2">
                  Complete your profile to get better matches
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
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
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Summary</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Account Type:</span> {user.userType}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Status:</span>{" "}
                {user.isVerified ? "Verified" : "Pending Verification"}
              </p>
              <Link href="/profile">
                <Button variant="outline" className="w-full mt-4">
                  {user.bio || user.location ? "Edit Profile" : "Complete Profile"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Ideas:</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Investors:</span>
                <span className="font-medium">567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Matches Today:</span>
                <span className="font-medium">89</span>
              </div>
              <Link href="/matches">
                <Button variant="outline" className="w-full mt-4">
                  View Matches
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-2">
              {user.userType === "creator"
                ? "Submit your first business idea to get started!"
                : "Create your first investment offer to begin matching with ideas!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}