import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new business idea
export const createBusinessIdea = mutation({
  args: {
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    fundingGoal: v.number(),
    currentFunding: v.number(),
    equityOffered: v.number(),
    valuation: v.optional(v.number()),
    stage: v.union(v.literal("concept"), v.literal("mvp"), v.literal("early"), v.literal("growth")),
    timeline: v.string(),
    teamSize: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("businessIdeas", {
      ...args,
      status: "draft" as const,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get business idea by ID
export const getBusinessIdea = query({
  args: { ideaId: v.id("businessIdeas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.ideaId);
  },
});

// Get all published business ideas
export const getPublishedIdeas = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("businessIdeas")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
  },
});

// Get business ideas by creator
export const getIdeasByCreator = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businessIdeas")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

// Get business ideas by category
export const getIdeasByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businessIdeas")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Update business idea
export const updateBusinessIdea = mutation({
  args: {
    ideaId: v.id("businessIdeas"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      fundingGoal: v.optional(v.number()),
      currentFunding: v.optional(v.number()),
      equityOffered: v.optional(v.number()),
      valuation: v.optional(v.number()),
      stage: v.optional(v.union(v.literal("concept"), v.literal("mvp"), v.literal("early"), v.literal("growth"))),
      timeline: v.optional(v.string()),
      teamSize: v.optional(v.number()),
      images: v.optional(v.array(v.string())),
      documents: v.optional(v.array(v.string())),
      videoUrl: v.optional(v.string()),
      status: v.optional(v.union(v.literal("draft"), v.literal("published"), v.literal("funded"), v.literal("cancelled"))),
    }),
  },
  handler: async (ctx, args) => {
    const { ideaId, updates } = args;

    return await ctx.db.patch(ideaId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete business idea
export const deleteBusinessIdea = mutation({
  args: { ideaId: v.id("businessIdeas") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.ideaId);
  },
});

// Search business ideas
export const searchIdeas = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("businessIdeas")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const filteredIdeas = ideas.filter(idea =>
      idea.title.toLowerCase().includes(args.query.toLowerCase()) ||
      idea.description.toLowerCase().includes(args.query.toLowerCase()) ||
      idea.category.toLowerCase().includes(args.query.toLowerCase()) ||
      idea.tags.some(tag => tag.toLowerCase().includes(args.query.toLowerCase()))
    );

    return filteredIdeas;
  },
});

// Get ideas by funding range
export const getIdeasByFundingRange = query({
  args: {
    minAmount: v.optional(v.number()),
    maxAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("businessIdeas")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return ideas.filter(idea => {
      if (args.minAmount && idea.fundingGoal < args.minAmount) return false;
      if (args.maxAmount && idea.fundingGoal > args.maxAmount) return false;
      return true;
    });
  },
});

// Get ideas by stage
export const getIdeasByStage = query({
  args: { stage: v.union(v.literal("concept"), v.literal("mvp"), v.literal("early"), v.literal("growth")) },
  handler: async (ctx, args) => {
    const ideas = await ctx.db.query("businessIdeas").collect();

    return ideas.filter(idea => idea.stage === args.stage);
  },
});