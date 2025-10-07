"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BusinessIdea } from "@/types";
import { SidebarLayout } from "@/components/navigation/sidebar";
import { animations } from "@/lib/animations";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

export default function IdeasPage() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<BusinessIdea[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Use Convex query to get published business ideas (with fallback)
  const rawBusinessIdeas = useQuery(api.businessIdeas?.getPublishedIdeas) || [];

  // Memoize the converted ideas to prevent unnecessary re-renders
  const businessIdeas = useMemo(() => {
    if (rawBusinessIdeas && rawBusinessIdeas.length > 0 && rawBusinessIdeas[0]._id) {
      return rawBusinessIdeas.map((idea: any) => ({
        id: idea._id,
        creatorId: idea.creatorId,
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tags: idea.tags || [],
        fundingGoal: idea.fundingGoal,
        currentFunding: idea.currentFunding,
        equityOffered: idea.equityOffered,
        valuation: idea.valuation,
        stage: idea.stage,
        timeline: idea.timeline,
        teamSize: idea.teamSize,
        status: idea.status,
        createdAt: idea.createdAt || Date.now(),
        updatedAt: idea.updatedAt || Date.now(),
      })) as BusinessIdea[];
    }
    return [];
  }, [rawBusinessIdeas]);

  useEffect(() => {
    if (businessIdeas.length > 0) {
      setIdeas(businessIdeas);
      setFilteredIdeas(businessIdeas);
      setIsLoading(false);
    } else if (businessIdeas.length === 0 && !isLoading) {
      // Only set loading to false if we've already tried loading
      setIsLoading(false);
    }
  }, [businessIdeas, isLoading]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading business ideas...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Business Ideas</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
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
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Filter by Category
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300">
            Showing {filteredIdeas.length} of {ideas.length} business ideas
          </p>
        </div>

        {/* Ideas Grid */}
        {filteredIdeas.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No ideas found</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search criteria"
                : "Be the first to submit a business idea!"
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{idea.category} • {idea.stage} stage</p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {idea.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {idea.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {idea.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{idea.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Funding Goal</p>
                      <p className="text-lg font-semibold text-green-400">
                        ${idea.fundingGoal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Equity</p>
                      <p className="text-lg font-semibold text-blue-400">
                        {idea.equityOffered}%
                      </p>
                    </div>
                  </div>

                  <Link href={`/ideas/${idea.id}`}>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </SidebarLayout>
  );
}