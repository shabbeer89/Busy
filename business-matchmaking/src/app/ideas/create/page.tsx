"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { IdeaForm } from "@/components/ideas/idea-form";
import { CreateBusinessIdeaData } from "@/types";

export default function CreateIdeaPage() {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated or not a creator
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please sign in to submit a business idea.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== "creator") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only creators can submit business ideas.</p>
        </div>
      </div>
    );
  }

  const handleIdeaSubmit = async (data: CreateBusinessIdeaData) => {
    setIsLoading(true);
    setError(null);

    try {
      // For demo purposes, simulate idea creation
      // In production, this would create the idea in the database
      console.log("Creating business idea:", data);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo: show success and redirect
      alert("Business idea submitted successfully!");
      router.push("/ideas");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit idea");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Business Idea</h1>
          <p className="text-gray-600 mt-2">
            Share your innovative business concept with our network of investors
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <IdeaForm
          onSubmit={handleIdeaSubmit}
          isLoading={isLoading}
          mode="create"
        />
      </div>
    </div>
  );
}