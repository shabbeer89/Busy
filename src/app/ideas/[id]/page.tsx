"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { BusinessIdea } from "@/types";

export default function IdeaDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo purposes
    const mockIdea: BusinessIdea = {
      id: id as string,
      creatorId: "creator-1",
      title: "AI-Powered Personal Finance Assistant",
      description: `An intelligent mobile app that uses machine learning to provide personalized financial advice, budgeting tools, and investment recommendations tailored to individual financial goals and risk tolerance.

This comprehensive platform combines advanced algorithms with user-friendly design to democratize financial planning. Users can connect their bank accounts, credit cards, and investment accounts for a complete financial picture.

Key features include:
• Automated expense categorization and budgeting
• Personalized investment portfolio recommendations
• Real-time financial goal tracking
• Educational content based on user behavior
• Integration with major financial institutions
• Advanced security with bank-level encryption

The target market includes millennials and Gen Z who are tech-savvy but financially inexperienced, representing a $50B+ market opportunity in the fintech space.`,
      category: "Technology",
      tags: ["AI", "Fintech", "Mobile App", "Personal Finance"],
      fundingGoal: 500000,
      currentFunding: 0,
      equityOffered: 15,
      valuation: 3000000,
      stage: "mvp",
      timeline: "12 months to launch, 24 months to profitability",
      teamSize: 5,
      status: "published",
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    };

    // Simulate API delay
    setTimeout(() => {
      setIdea(mockIdea);
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading idea details...</p>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Idea Not Found</h1>
          <p className="text-gray-600">The business idea you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            ← Back to Ideas
          </Button>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="capitalize">{idea.category}</span>
                  <span>•</span>
                  <span className="capitalize">{idea.stage} stage</span>
                  <span>•</span>
                  <span>{idea.teamSize} team member{idea.teamSize !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${idea.fundingGoal.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Funding Goal</div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{idea.equityOffered}%</div>
                <div className="text-sm text-gray-600">Equity Offered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${idea.valuation?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Pre-money Valuation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${idea.currentFunding.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Currently Raised</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {idea.description}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {idea.timeline && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                <p className="text-gray-700">{idea.timeline}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {user?.userType === "investor" && (
                <>
                  <Button size="lg">
                    Express Interest
                  </Button>
                  <Button size="lg" variant="outline">
                    Add to Watchlist
                  </Button>
                </>
              )}
              {user?.userType === "creator" && idea.creatorId === user.id && (
                <>
                  <Button size="lg" variant="outline">
                    Edit Idea
                  </Button>
                  <Button size="lg" variant="outline">
                    View Analytics
                  </Button>
                </>
              )}
              <Button size="lg" variant="ghost">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}