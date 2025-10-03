"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { BusinessIdea } from "@/types";
import { SidebarLayout } from "@/components/navigation/sidebar";

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<BusinessIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demo purposes
  useEffect(() => {
    const mockIdeas: BusinessIdea[] = [
      {
        id: "1",
        creatorId: "creator-1",
        title: "AI-Powered Personal Finance Assistant",
        description: "An intelligent mobile app that uses machine learning to provide personalized financial advice, budgeting tools, and investment recommendations tailored to individual financial goals and risk tolerance.",
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
        createdAt: Date.now() - 86400000, // 1 day ago
        updatedAt: Date.now() - 86400000,
      },
      {
        id: "2",
        creatorId: "creator-2",
        title: "Sustainable Urban Farming Solutions",
        description: "Vertical farming technology for urban environments, enabling restaurants and households to grow fresh produce year-round using 90% less water and space than traditional farming.",
        category: "Agriculture",
        tags: ["Sustainability", "Urban Farming", "AgriTech", "Green Technology"],
        fundingGoal: 750000,
        currentFunding: 150000,
        equityOffered: 20,
        stage: "early",
        timeline: "6 months to market expansion",
        teamSize: 8,
        status: "published",
        createdAt: Date.now() - 172800000, // 2 days ago
        updatedAt: Date.now() - 172800000,
      },
      {
        id: "3",
        creatorId: "creator-3",
        title: "Telemedicine Platform for Mental Health",
        description: "A comprehensive telemedicine platform specifically designed for mental health services, connecting patients with licensed therapists and providing evidence-based digital therapeutics.",
        category: "Healthcare",
        tags: ["Telemedicine", "Mental Health", "Healthcare", "Digital Health"],
        fundingGoal: 1000000,
        currentFunding: 300000,
        equityOffered: 12,
        valuation: 8000000,
        stage: "growth",
        timeline: "Already profitable, expanding to new markets",
        teamSize: 15,
        status: "published",
        createdAt: Date.now() - 259200000, // 3 days ago
        updatedAt: Date.now() - 259200000,
      },
    ];

    setIdeas(mockIdeas);
    setFilteredIdeas(mockIdeas);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let filtered = ideas;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredIdeas(filtered);
  }, [ideas, selectedCategory, searchTerm]);

  const categories = ["all", "Technology", "Healthcare", "Finance", "Agriculture", "E-commerce"];

  if (isLoading) {
    return (
            <SidebarLayout>

      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business ideas...</p>
        </div>
      </div>
      </SidebarLayout>
    );
  }

  return (
          <SidebarLayout>

    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Business Ideas</h1>
              <p className="text-muted-foreground mt-2">
                Discover innovative business opportunities from entrepreneurs worldwide
              </p>
            </div>
            {user?.userType === "creator" && (
              <Link href="/ideas/create">
                <Button>Submit Your Idea</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-foreground mb-2">
                  Search Ideas
                </label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, or tags..."
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                  Filter by Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredIdeas.length} of {ideas.length} business ideas
          </p>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search criteria"
                : "Be the first to submit a business idea!"
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">{idea.category} • {idea.stage} stage</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {idea.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {idea.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{idea.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Funding Goal</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${idea.fundingGoal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Equity</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {idea.equityOffered}%
                      </p>
                    </div>
                  </div>

                  <Link href={`/ideas/${idea.id}`}>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
}