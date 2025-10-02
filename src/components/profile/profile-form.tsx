"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, UpdateUserData } from "@/types";

interface ProfileFormProps {
  user: User;
  onSubmit: (data: UpdateUserData) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ user, onSubmit, isLoading = false }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateUserData>({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
    socialLinks: user.socialLinks || {},
    // Creator specific fields
    companyName: user.companyName || "",
    industry: user.industry || "",
    experience: user.experience || "",
    // Investor specific fields
    investmentRange: user.investmentRange || { min: 0, max: 0 },
    preferredIndustries: user.preferredIndustries || [],
    riskTolerance: user.riskTolerance || "medium",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const handleInvestmentRangeChange = (field: 'min' | 'max', value: string) => {
    setFormData(prev => ({
      ...prev,
      investmentRange: {
        ...prev.investmentRange!,
        [field]: parseInt(value) || 0,
      },
    }));
  };

  const handlePreferredIndustryChange = (industry: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredIndustries: checked
        ? [...(prev.preferredIndustries || []), industry]
        : (prev.preferredIndustries || []).filter(i => i !== industry),
    }));
  };

  const industries = [
    "Technology", "Healthcare", "Finance", "Education", "E-commerce",
    "Real Estate", "Energy", "Agriculture", "Manufacturing", "Retail"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="City, Country"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn
            </label>
            <input
              type="url"
              id="linkedin"
              value={formData.socialLinks?.linkedin || ""}
              onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 mb-2">
              Twitter
            </label>
            <input
              type="url"
              id="twitter"
              value={formData.socialLinks?.twitter || ""}
              onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
      </div>

      {/* Creator Specific Fields */}
      {user.userType === "creator" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Creator Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Experience & Background
              </label>
              <textarea
                id="experience"
                name="experience"
                rows={3}
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your relevant experience, skills, and background..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Investor Specific Fields */}
      {user.userType === "investor" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Preferences</h2>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="investmentMin" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Investment ($)
                </label>
                <input
                  type="number"
                  id="investmentMin"
                  value={formData.investmentRange?.min || ""}
                  onChange={(e) => handleInvestmentRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10000"
                />
              </div>

              <div>
                <label htmlFor="investmentMax" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Investment ($)
                </label>
                <input
                  type="number"
                  id="investmentMax"
                  value={formData.investmentRange?.max || ""}
                  onChange={(e) => handleInvestmentRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk Tolerance
              </label>
              <select
                name="riskTolerance"
                value={formData.riskTolerance}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low - Prefer stable, proven opportunities</option>
                <option value="medium">Medium - Balanced risk and reward</option>
                <option value="high">High - Open to innovative, high-growth opportunities</option>
              </select>
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
                      checked={formData.preferredIndustries?.includes(industry) || false}
                      onChange={(e) => handlePreferredIndustryChange(industry, e.target.checked)}
                      className="mr-2"
                    />
                    {industry}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2"
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </form>
  );
}