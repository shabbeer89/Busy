"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { OfferForm } from "@/components/offers/offer-form";
import { CreateInvestmentOfferData } from "@/types";
import { createClient } from "@/lib/supabase";

export default function CreateOfferPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const supabase = createClient();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to create investment offers.</p>
        </div>
      </div>
    );
  }

  if (user.userType !== "investor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Only investors can create investment offers.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: CreateInvestmentOfferData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await (supabase as any)
        .from('investment_offers')
        .insert([
          {
            investor_id: user.id,
            title: data.title,
            description: data.description,
            amount_range: data.amountRange,
            preferred_equity: data.preferredEquity,
            preferred_stages: data.preferredStages,
            preferred_industries: data.preferredIndustries,
            geographic_preference: data.geographicPreference,
            investment_type: data.investmentType,
            timeline: data.timeline,
            is_active: true,
          }
        ]);

      if (error) throw error;

      router.push("/offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create offer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Investment Offer</h1>
          <p className="text-gray-600 mt-2">
            Define your investment criteria and preferences to attract matching business ideas.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <OfferForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
      </div>
    </div>
  );
}
