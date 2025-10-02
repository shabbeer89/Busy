import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new investment offer
export const createInvestmentOffer = mutation({
  args: {
    investorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    amountRange: v.object({
      min: v.number(),
      max: v.number(),
    }),
    preferredEquity: v.object({
      min: v.number(),
      max: v.number(),
    }),
    preferredStages: v.array(v.string()),
    preferredIndustries: v.array(v.string()),
    geographicPreference: v.optional(v.string()),
    investmentType: v.union(v.literal("equity"), v.literal("debt"), v.literal("convertible")),
    timeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("investmentOffers", {
      ...args,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get investment offer by ID
export const getInvestmentOffer = query({
  args: { offerId: v.id("investmentOffers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.offerId);
  },
});

// Get all active investment offers
export const getActiveOffers = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("investmentOffers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

// Get investment offers by investor
export const getOffersByInvestor = query({
  args: { investorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("investmentOffers")
      .withIndex("by_investor", (q) => q.eq("investorId", args.investorId))
      .collect();
  },
});

// Update investment offer
export const updateInvestmentOffer = mutation({
  args: {
    offerId: v.id("investmentOffers"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      amountRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
      preferredEquity: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
      preferredStages: v.optional(v.array(v.string())),
      preferredIndustries: v.optional(v.array(v.string())),
      geographicPreference: v.optional(v.string()),
      investmentType: v.optional(v.union(v.literal("equity"), v.literal("debt"), v.literal("convertible"))),
      timeline: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const { offerId, updates } = args;

    return await ctx.db.patch(offerId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete investment offer
export const deleteInvestmentOffer = mutation({
  args: { offerId: v.id("investmentOffers") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.offerId);
  },
});

// Search investment offers
export const searchOffers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("investmentOffers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const filteredOffers = offers.filter(offer =>
      offer.title.toLowerCase().includes(args.query.toLowerCase()) ||
      offer.description.toLowerCase().includes(args.query.toLowerCase()) ||
      offer.preferredIndustries.some(industry =>
        industry.toLowerCase().includes(args.query.toLowerCase())
      )
    );

    return filteredOffers;
  },
});

// Get offers by investment range
export const getOffersByAmountRange = query({
  args: {
    minAmount: v.optional(v.number()),
    maxAmount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("investmentOffers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return offers.filter(offer => {
      if (args.minAmount && offer.amountRange.max < args.minAmount) return false;
      if (args.maxAmount && offer.amountRange.min > args.maxAmount) return false;
      return true;
    });
  },
});

// Get offers by preferred industries
export const getOffersByIndustries = query({
  args: { industries: v.array(v.string()) },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("investmentOffers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return offers.filter(offer =>
      args.industries.some(industry =>
        offer.preferredIndustries.includes(industry)
      )
    );
  },
});

// Get offers by investment type
export const getOffersByType = query({
  args: { investmentType: v.union(v.literal("equity"), v.literal("debt"), v.literal("convertible")) },
  handler: async (ctx, args) => {
    const offers = await ctx.db.query("investmentOffers").collect();

    return offers.filter(offer => offer.investmentType === args.investmentType);
  },
});

// Get offers by preferred stages
export const getOffersByStages = query({
  args: { stages: v.array(v.string()) },
  handler: async (ctx, args) => {
    const offers = await ctx.db
      .query("investmentOffers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    return offers.filter(offer =>
      args.stages.some(stage =>
        offer.preferredStages.includes(stage)
      )
    );
  },
});