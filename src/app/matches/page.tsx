"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MatchesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to view your matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Matches</h1>
          <p className="text-gray-600 mt-2">
            Discover and manage your {user.userType === "creator" ? "investor matches" : "business idea matches"}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h2>
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
      </div>
    </div>
  );
}