"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { IdeaForm } from "@/components/ideas/idea-form";
import { CreateBusinessIdeaData } from "@/types";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function CreateIdeaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const createIdeaMutation = useMutation(api.businessIdeas.createBusinessIdea);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to submit business ideas.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== "creator") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only creators can submit business ideas.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateBusinessIdeaData) => {
    setIsLoading(true);
    setError(null);

    try {
      await createIdeaMutation({
        creatorId: user.id as any,
        currentFunding: 0, // Start with no current funding
        ...data,
      });

      router.push("/ideas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create idea");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Submit Your Business Idea</h1>
          <p className="text-gray-600 mt-2">
            Share your innovative business concept with our network of investors and get matched with the right funding opportunities.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <IdeaForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
      </div>
    </div>
  );
}