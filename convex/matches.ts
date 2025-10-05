import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Calculate match score between idea and offer
function calculateMatchScore(idea: any, offer: any, creator: any, investor: any): {
  score: number;
  factors: {
    amountCompatibility: number;
    industryAlignment: number;
    stagePreference: number;
    riskAlignment: number;
  };
} {
  let totalScore = 0;
  const factors = {
    amountCompatibility: 0,
    industryAlignment: 0,
    stagePreference: 0,
    riskAlignment: 0,
  };

  // Amount compatibility (40% weight)
  const ideaAmount = idea.fundingGoal;
  const offerMin = offer.amountRange.min;
  const offerMax = offer.amountRange.max;

  if (ideaAmount >= offerMin && ideaAmount <= offerMax) {
    factors.amountCompatibility = 100;
    totalScore += 40;
  } else if (ideaAmount < offerMin) {
    // Partial score for amounts within 50% of range
    const ratio = ideaAmount / offerMin;
    factors.amountCompatibility = Math.max(0, (ratio - 0.5) * 200);
    totalScore += (factors.amountCompatibility / 100) * 40;
  } else {
    // Amount exceeds max range
    const ratio = offerMax / ideaAmount;
    factors.amountCompatibility = Math.max(0, (ratio - 0.5) * 200);
    totalScore += (factors.amountCompatibility / 100) * 40;
  }

  // Industry alignment (30% weight)
  const ideaCategory = idea.category.toLowerCase();
  const offerIndustries = offer.preferredIndustries.map((i: string) => i.toLowerCase());

  const industryMatch = offerIndustries.some((industry: string) =>
    ideaCategory.includes(industry) || industry.includes(ideaCategory)
  );

  if (industryMatch) {
    factors.industryAlignment = 100;
    totalScore += 30;
  } else {
    // Check tags for partial matches
    const tagMatches = idea.tags.filter((tag: string) =>
      offerIndustries.some((industry: string) => tag.toLowerCase().includes(industry))
    ).length;

    if (tagMatches > 0) {
      factors.industryAlignment = Math.min(80, tagMatches * 20);
      totalScore += (factors.industryAlignment / 100) * 30;
    }
  }

  // Stage preference (20% weight)
  const stageMatch = offer.preferredStages.includes(idea.stage);
  if (stageMatch) {
    factors.stagePreference = 100;
    totalScore += 20;
  } else {
    factors.stagePreference = 0;
  }

  // Risk alignment (10% weight) - based on creator experience and idea stage
  const creatorExperience = creator.experience || '';
  const hasExperience = creatorExperience.toLowerCase().includes('experienced') ||
                       creatorExperience.toLowerCase().includes('serial') ||
                       creatorExperience.toLowerCase().includes('expert');

  const investorRiskTolerance = investor.riskTolerance || 'medium';

  let riskScore = 50; // Base score

  if (investorRiskTolerance === 'high' && (idea.stage === 'concept' || !hasExperience)) {
    riskScore = 80;
  } else if (investorRiskTolerance === 'medium' && idea.stage !== 'concept') {
    riskScore = 70;
  } else if (investorRiskTolerance === 'low' && hasExperience && idea.stage !== 'concept') {
    riskScore = 90;
  } else if (investorRiskTolerance === 'low' && (!hasExperience || idea.stage === 'concept')) {
    riskScore = 30;
  }

  factors.riskAlignment = riskScore;
  totalScore += (riskScore / 100) * 10;

  return {
    score: Math.round(totalScore),
    factors,
  };
}

// Find matches for a specific idea
export const findMatchesForIdea = mutation({
  args: { ideaId: v.id("businessIdeas") },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.status !== "published") {
      throw new Error("Idea not found or not published");
    }

    const creator = await ctx.db.get(idea.creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    // Get active offers
    const offers = await ctx.db
      .query("investmentOffers")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    // Get investors for risk calculation
    const investors = await ctx.db.query("users")
      .withIndex("by_userType", (q) => q.eq("userType", "investor"))
      .collect();

    const investorMap = new Map(investors.map(inv => [inv._id, inv]));

    const matches = [];

    for (const offer of offers) {
      const investor = investorMap.get(offer.investorId);
      if (!investor) continue;

      // Check if match already exists
      const existingMatch = await ctx.db
        .query("matches")
        .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
        .filter((q) => q.eq(q.field("offerId"), offer._id))
        .first();

      if (existingMatch) continue;

      const { score, factors } = calculateMatchScore(idea, offer, creator, investor);

      // Only create matches with score > 50
      if (score >= 50) {
        const matchId = await ctx.db.insert("matches", {
          ideaId: args.ideaId,
          investorId: offer.investorId,
          creatorId: idea.creatorId,
          offerId: offer._id,
          matchScore: score,
          matchingFactors: factors,
          status: "suggested",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        matches.push({
          matchId,
          score,
          offer: offer.title,
          investor: investor.name,
        });
      }
    }

    return matches;
  },
});

// Find matches for a specific offer
export const findMatchesForOffer = mutation({
  args: { offerId: v.id("investmentOffers") },
  handler: async (ctx, args) => {
    const offer = await ctx.db.get(args.offerId);
    if (!offer || !offer.isActive) {
      throw new Error("Offer not found or not active");
    }

    const investor = await ctx.db.get(offer.investorId);
    if (!investor) {
      throw new Error("Investor not found");
    }

    // Get published ideas
    const ideas = await ctx.db
      .query("businessIdeas")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const creators = await ctx.db.query("users")
      .withIndex("by_userType", (q) => q.eq("userType", "creator"))
      .collect();

    const creatorMap = new Map(creators.map(c => [c._id, c]));

    const matches = [];

    for (const idea of ideas) {
      const creator = creatorMap.get(idea.creatorId);
      if (!creator) continue;

      // Check if match already exists
      const existingMatch = await ctx.db
        .query("matches")
        .withIndex("by_idea", (q) => q.eq("ideaId", idea._id))
        .filter((q) => q.eq(q.field("offerId"), args.offerId))
        .first();

      if (existingMatch) continue;

      const { score, factors } = calculateMatchScore(idea, offer, creator, investor);

      // Only create matches with score > 50
      if (score >= 50) {
        const matchId = await ctx.db.insert("matches", {
          ideaId: idea._id,
          investorId: offer.investorId,
          creatorId: idea.creatorId,
          offerId: args.offerId,
          matchScore: score,
          matchingFactors: factors,
          status: "suggested",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        matches.push({
          matchId,
          score,
          idea: idea.title,
          creator: creator.name,
        });
      }
    }

    return matches;
  },
});

// Get match by ID
export const getMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.matchId);
  },
});

// Get matches by idea
export const getMatchesByIdea = query({
  args: { ideaId: v.id("businessIdeas") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();
  },
});

// Get matches by investor
export const getMatchesByInvestor = query({
  args: { investorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_investor", (q) => q.eq("investorId", args.investorId))
      .collect();
  },
});

// Get matches by creator
export const getMatchesByCreator = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

// Update match status
export const updateMatchStatus = mutation({
  args: {
    matchId: v.id("matches"),
    status: v.union(
      v.literal("suggested"),
      v.literal("viewed"),
      v.literal("contacted"),
      v.literal("negotiating"),
      v.literal("invested"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.matchId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Get matches by status
export const getMatchesByStatus = query({
  args: {
    status: v.union(
      v.literal("suggested"),
      v.literal("viewed"),
      v.literal("contacted"),
      v.literal("negotiating"),
      v.literal("invested"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Get top matches for an idea
export const getTopMatchesForIdea = query({
  args: { ideaId: v.id("businessIdeas"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const matches = await ctx.db
      .query("matches")
      .withIndex("by_idea", (q) => q.eq("ideaId", args.ideaId))
      .collect();

    // Sort by match score and limit results
    const limit = args.limit || 10;
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  },
});