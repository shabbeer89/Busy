"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateInvestmentOfferData, BusinessStage } from "@/types";

interface OfferFormProps {
  onSubmit: (data: CreateInvestmentOfferData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateInvestmentOfferData>;
  mode?: "create" | "edit";
}

export function OfferForm({ onSubmit, isLoading = false, initialData, mode = "create" }: OfferFormProps) {
  const [formData, setFormData] = useState<CreateInvestmentOfferData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    amountRange: initialData?.amountRange || { min: 10000, max: 100000 },
    preferredEquity: initialData?.preferredEquity || { min: 5, max: 25 },
    preferredStages: initialData?.preferredStages || [],
    preferredIndustries: initialData?.preferredIndustries || [],
    geographicPreference: initialData?.geographicPreference || "",
    investmentType: initialData?.investmentType || "equity",
    timeline: initialData?.timeline || "",
  });

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce",
    "Real Estate", "Energy", "Agriculture", "Manufacturing", "Retail",
    "Food & Beverage", "Transportation", "Entertainment", "Other"
  ];

  const stages: BusinessStage[] = ["concept", "mvp", "early", "growth"];
  const investmentTypes = ["equity", "debt", "convertible"] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "investmentType" ? value : value,
    }));
  };

  const handleAmountRangeChange = (field: 'min' | 'max', value: string) => {
    setFormData(prev => ({
      ...prev,
      amountRange: {
        ...prev.amountRange,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleEquityRangeChange = (field: 'min' | 'max', value: string) => {
    setFormData(prev => ({
      ...prev,
      preferredEquity: {
        ...prev.preferredEquity,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handleStageToggle = (stage: BusinessStage) => {
    setFormData(prev => ({
      ...prev,
      preferredStages: prev.preferredStages.includes(stage)
        ? prev.preferredStages.filter(s => s !== stage)
        : [...prev.preferredStages, stage],
    }));
  };

  const handleIndustryToggle = (industry: string) => {
    setFormData(prev => ({
      ...prev,
      preferredIndustries: prev.preferredIndustries.includes(industry)
        ? prev.preferredIndustries.filter(i => i !== industry)
        : [...prev.preferredIndustries, industry],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Offer Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Offer Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Tech Startup Investment Fund"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your investment criteria, what you're looking for in startups, your investment philosophy, etc."
            />
          </div>
        </div>
      </div>

      {/* Investment Range */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Range</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="amountMin" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Investment ($)
            </label>
            <input
              type="number"
              id="amountMin"
              value={formData.amountRange.min || ""}
              onChange={(e) => handleAmountRangeChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10000"
              min="1000"
              step="1000"
            />
          </div>

          <div>
            <label htmlFor="amountMax" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Investment ($)
            </label>
            <input
              type="number"
              id="amountMax"
              value={formData.amountRange.max || ""}
              onChange={(e) => handleAmountRangeChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100000"
              min="1000"
              step="1000"
            />
          </div>
        </div>
      </div>

      {/* Equity Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Equity Preferences</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="equityMin" className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Equity (%)
            </label>
            <input
              type="number"
              id="equityMin"
              value={formData.preferredEquity.min || ""}
              onChange={(e) => handleEquityRangeChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="5"
              min="0.1"
              max="100"
              step="0.1"
            />
          </div>

          <div>
            <label htmlFor="equityMax" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Equity (%)
            </label>
            <input
              type="number"
              id="equityMax"
              value={formData.preferredEquity.max || ""}
              onChange={(e) => handleEquityRangeChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="25"
              min="0.1"
              max="100"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Investment Preferences */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Preferences</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Investment Type
            </label>
            <select
              name="investmentType"
              value={formData.investmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="equity">Equity Investment</option>
              <option value="debt">Debt/Loan</option>
              <option value="convertible">Convertible Note</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Business Stages
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {stages.map(stage => (
                <label key={stage} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferredStages.includes(stage)}
                    onChange={() => handleStageToggle(stage)}
                    className="mr-2"
                  />
                  <span className="capitalize">{stage}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Industries
            </label>
            <div className="grid md:grid-cols-3 gap-3">
              {industries.map(industry => (
                <label key={industry} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferredIndustries.includes(industry)}
                    onChange={() => handleIndustryToggle(industry)}
                    className="mr-2"
                  />
                  {industry}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="geographicPreference" className="block text-sm font-medium text-gray-700 mb-2">
              Geographic Preference
            </label>
            <input
              type="text"
              id="geographicPreference"
              name="geographicPreference"
              value={formData.geographicPreference}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., North America, Europe, Global, etc."
            />
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
              Investment Timeline
            </label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Looking to invest within 3-6 months, Open to long-term opportunities"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2"
        >
          {isLoading ? "Saving..." : mode === "create" ? "Create Investment Offer" : "Update Offer"}
        </Button>
      </div>
    </form>
  );
}