import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles for both creators and investors
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phoneNumber: v.optional(v.string()),
    avatar: v.optional(v.string()),
    userType: v.union(v.literal("creator"), v.literal("investor")),
    isVerified: v.boolean(),
    phoneVerified: v.optional(v.boolean()),
    oauthId: v.optional(v.string()),
    provider: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Creator specific fields
    companyName: v.optional(v.string()),
    industry: v.optional(v.string()),
    experience: v.optional(v.string()),

    // Investor specific fields
    investmentRange: v.optional(v.object({
      min: v.number(),
      max: v.number(),
    })),
    preferredIndustries: v.optional(v.array(v.string())),
    riskTolerance: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),

    // Common fields
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
  })
    .index("by_email", ["email"])
    .index("by_phone", ["phoneNumber"])
    .index("by_userType", ["userType"]),

  // Business ideas from creators
  businessIdeas: defineTable({
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    tags: v.array(v.string()),

    // Financial details
    fundingGoal: v.number(),
    currentFunding: v.number(),
    equityOffered: v.number(),
    valuation: v.optional(v.number()),

    // Project details
    stage: v.union(v.literal("concept"), v.literal("mvp"), v.literal("early"), v.literal("growth")),
    timeline: v.string(),
    teamSize: v.optional(v.number()),

    // Media
    images: v.optional(v.array(v.string())),
    documents: v.optional(v.array(v.string())),
    videoUrl: v.optional(v.string()),

    // Status
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("funded"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  // Investment offers from investors
  investmentOffers: defineTable({
    investorId: v.id("users"),
    title: v.string(),
    description: v.string(),

    // Investment details
    amountRange: v.object({
      min: v.number(),
      max: v.number(),
    }),
    preferredEquity: v.object({
      min: v.number(),
      max: v.number(),
    }),

    // Preferences
    preferredStages: v.array(v.string()),
    preferredIndustries: v.array(v.string()),
    geographicPreference: v.optional(v.string()),

    // Terms
    investmentType: v.union(v.literal("equity"), v.literal("debt"), v.literal("convertible")),
    timeline: v.optional(v.string()),

    // Status
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_investor", ["investorId"])
    .index("by_active", ["isActive"]),

  // Matches between ideas and investment offers
  matches: defineTable({
    ideaId: v.id("businessIdeas"),
    investorId: v.id("users"),
    creatorId: v.id("users"),
    offerId: v.id("investmentOffers"),

    // Match details
    matchScore: v.number(),
    matchingFactors: v.object({
      amountCompatibility: v.number(),
      industryAlignment: v.number(),
      stagePreference: v.number(),
      riskAlignment: v.number(),
    }),

    // Status
    status: v.union(
      v.literal("suggested"),
      v.literal("viewed"),
      v.literal("contacted"),
      v.literal("negotiating"),
      v.literal("invested"),
      v.literal("rejected")
    ),

    // Communication
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_idea", ["ideaId"])
    .index("by_investor", ["investorId"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"]),

  // Investment transactions
  transactions: defineTable({
    matchId: v.id("matches"),
    investorId: v.id("users"),
    creatorId: v.id("users"),

    // Transaction details
    amount: v.number(),
    currency: v.string(),
    cryptoTxHash: v.optional(v.string()),

    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),

    // Payment method
    paymentMethod: v.union(v.literal("crypto"), v.literal("bank_transfer")),
    walletAddress: v.optional(v.string()),

    createdAt: v.number(),
    confirmedAt: v.optional(v.number()),
  })
    .index("by_match", ["matchId"])
    .index("by_investor", ["investorId"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"]),

  // User favorites for offers and ideas
  favorites: defineTable({
    userId: v.id("users"),
    itemId: v.string(), // ID of the offer or idea being favorited
    itemType: v.union(v.literal("offer"), v.literal("idea")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_item", ["itemId", "itemType"])
    .index("by_user_item", ["userId", "itemId", "itemType"]),
});