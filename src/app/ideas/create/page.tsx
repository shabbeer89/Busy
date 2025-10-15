"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { IdeaForm } from "@/components/ideas/idea-form";
import { CreateBusinessIdeaData } from "@/types";
// Using Supabase for data operations
// import { useMutation } from "convex/react";
// import { api } from "../../../../convex/_generated/api";

export default function CreateIdeaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-4">Please sign in to submit business ideas.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== "creator") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-300 mb-4">Only creators can submit business ideas.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateBusinessIdeaData) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Supabase insertion when database schema is ready
      console.log("Creating idea:", {
        creatorId: user.id as any,
        currentFunding: 0, // Start with no current funding
        ...data,
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push("/ideas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Submit Your Business Idea</h1>
          <p className="text-slate-300 mt-2">
            Share your innovative business concept with our network of investors and get matched with the right funding opportunities.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <IdeaForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
      </div>
    </div>
  );
}