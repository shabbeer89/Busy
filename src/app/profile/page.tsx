"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { Button } from "@/components/ui/button";
import { UpdateUserData } from "@/types";
import { SidebarLayout } from "@/components/navigation/sidebar";

export default function ProfilePage() {
  const { user } = useAuth();
  const { updateProfile, profileStatus } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!user) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-300">Please sign in to view your profile.</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const handleProfileUpdate = async (data: UpdateUserData) => {
    setIsLoading(true);
    setMessage(null);

    const result = await updateProfile(data);

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update profile. Please try again." });
    }

    setIsLoading(false);
  };

  return (
          <SidebarLayout>

    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Manage your {user.userType} profile information
              </p>
              {profileStatus && (
                <div className="mt-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profileStatus.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {profileStatus.percentage}% complete
                        </span>
                    </div>
                    {!profileStatus.isComplete && (
                      <span className="text-sm text-amber-400">
                        Complete your profile to improve matching
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                {profileStatus?.isComplete ? "Edit Profile" : "Complete Profile"}
              </Button>
            )}
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-900/20 text-green-400 border border-green-400"
              : "bg-red-900/20 text-red-400 border border-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {isEditing ? (
          <div>
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
            <ProfileForm
              user={user}
              onSubmit={handleProfileUpdate}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                <div className="text-center">
                  <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-300">
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 capitalize">{user.userType}</p>
                  {user.location && (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{user.location}</p>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Email:</span>
                    <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isVerified
                        ? "bg-green-900/20 text-green-400"
                        : "bg-yellow-900/20 text-yellow-400"
                    }`}>
                      {user.isVerified ? "Verified" : "Pending Verification"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name:</span>
                    <p className="text-gray-900 dark:text-white">{user.name}</p>
                  </div>
                  {user.location && (
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</span>
                      <p className="text-gray-900 dark:text-white">{user.location}</p>
                    </div>
                  )}
                  {user.website && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Website:</span>
                      <p className="text-gray-900 dark:text-white">
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                          {user.website}
                        </a>
                      </p>
                    </div>
                  )}
                  {user.bio && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio:</span>
                      <p className="text-gray-900 dark:text-white mt-1">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {(user.socialLinks?.linkedin || user.socialLinks?.twitter) && (
                <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Links</h3>
                  <div className="space-y-2">
                    {user.socialLinks?.linkedin && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn:</span>
                        <p className="text-gray-900 dark:text-white">
                          <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                            {user.socialLinks.linkedin}
                          </a>
                        </p>
                      </div>
                    )}
                    {user.socialLinks?.twitter && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Twitter:</span>
                        <p className="text-gray-900 dark:text-white">
                          <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                            {user.socialLinks.twitter}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Creator Specific Information */}
              {user.userType === "creator" && (
                <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Creator Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.companyName && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Company:</span>
                        <p className="text-gray-900 dark:text-white">{user.companyName}</p>
                      </div>
                    )}
                    {user.industry && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry:</span>
                        <p className="text-gray-900 dark:text-white">{user.industry}</p>
                      </div>
                    )}
                    {user.experience && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{user.experience}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Investor Specific Information */}
              {user.userType === "investor" && (
                <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Investment Preferences</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.investmentRange && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Range:</span>
                        <p className="text-gray-900 dark:text-white">
                          ${user.investmentRange.min.toLocaleString()} - ${user.investmentRange.max.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {user.riskTolerance && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Tolerance:</span>
                        <p className="text-gray-900 dark:text-white capitalize">{user.riskTolerance}</p>
                      </div>
                    )}
                    {user.preferredIndustries && user.preferredIndustries.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preferred Industries:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.preferredIndustries.map(industry => (
                            <span key={industry} className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded-full text-sm">
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Summary */}
              <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Summary</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {user.userType === "creator" ? "3" : "7"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.userType === "creator" ? "Ideas Submitted" : "Offers Created"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {user.userType === "creator" ? "5" : "12"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.userType === "creator" ? "Active Matches" : "Active Matches"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-slate-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {user.userType === "creator" ? "2" : "1"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.userType === "creator" ? "Successful Deals" : "Investments Made"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg">
                    <div className="w-8 h-8 bg-blue-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">New match found</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">AI Assistant matched with Tech Ventures (92% compatibility)</p>
                    </div>
                    <span className="text-xs text-gray-500">2h ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg">
                    <div className="w-8 h-8 bg-green-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Profile completed</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Your profile is now 100% complete</p>
                    </div>
                    <span className="text-xs text-gray-500">1d ago</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg">
                    <div className="w-8 h-8 bg-purple-900/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Investment offer created</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Created "Tech-Focused Growth Capital" offer</p>
                    </div>
                    <span className="text-xs text-gray-500">3d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
          </SidebarLayout>
  );
}