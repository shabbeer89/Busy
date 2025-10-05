"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateBusinessIdeaData, BusinessStage } from "@/types";

interface IdeaFormProps {
  onSubmit: (data: CreateBusinessIdeaData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<CreateBusinessIdeaData>;
  mode?: "create" | "edit";
}

export function IdeaForm({ onSubmit, isLoading = false, initialData, mode = "create" }: IdeaFormProps) {
  const [formData, setFormData] = useState<CreateBusinessIdeaData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    tags: initialData?.tags || [],
    fundingGoal: initialData?.fundingGoal || 0,
    equityOffered: initialData?.equityOffered || 0,
    stage: initialData?.stage || "concept",
    timeline: initialData?.timeline || "",
    teamSize: initialData?.teamSize || 1,
  });

  const [newTag, setNewTag] = useState("");

  const categories = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce",
    "Real Estate", "Energy", "Agriculture", "Manufacturing", "Retail",
    "Food & Beverage", "Transportation", "Entertainment", "Other"
  ];

  const stages: BusinessStage[] = ["concept", "mvp", "early", "growth"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "fundingGoal" || name === "equityOffered" || name === "teamSize"
        ? parseInt(value) || 0
        : value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Idea Details</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Idea Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a compelling title for your business idea"
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
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your business idea in detail. Include the problem you're solving, your solution, target market, and unique value proposition."
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
              Development Stage *
            </label>
            <select
              id="stage"
              name="stage"
              required
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="concept">Concept Stage</option>
              <option value="mvp">MVP (Minimum Viable Product)</option>
              <option value="early">Early Stage</option>
              <option value="growth">Growth Stage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Requirements</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="fundingGoal" className="block text-sm font-medium text-gray-700 mb-2">
              Funding Goal ($) *
            </label>
            <input
              type="number"
              id="fundingGoal"
              name="fundingGoal"
              required
              min="1000"
              step="1000"
              value={formData.fundingGoal || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
          </div>

          <div>
            <label htmlFor="equityOffered" className="block text-sm font-medium text-gray-700 mb-2">
              Equity Offered (%)
            </label>
            <input
              type="number"
              id="equityOffered"
              name="equityOffered"
              required
              min="0.1"
              max="100"
              step="0.1"
              value={formData.equityOffered || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10"
            />
          </div>

          <div>
            <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
              Team Size
            </label>
            <input
              type="number"
              id="teamSize"
              name="teamSize"
              min="1"
              value={formData.teamSize || ""}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1"
            />
          </div>
        </div>
      </div>

      {/* Timeline and Tags */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Timeline & Tags</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
              Timeline
            </label>
            <input
              type="text"
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 6-12 months to launch, 2 years to profitability"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
          {isLoading ? "Saving..." : mode === "create" ? "Submit Idea" : "Update Idea"}
        </Button>
      </div>
    </form>
  );
}