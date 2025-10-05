import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { sampleUsers, sampleBusinessIdeas, sampleInvestmentOffers, sampleMatches, getRandomTimestamp, getRandomCurrentFunding } from "./sampleData";

// Seed users into the database
export const seedUsers = mutation({
  handler: async (ctx) => {
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        ...userData,
        createdAt: now,
        updatedAt: now,
      });
      createdUsers.push(userId);
    }

    return { message: `Successfully created ${createdUsers.length} users`, userIds: createdUsers };
  },
});

// Seed business ideas into the database
export const seedBusinessIdeas = mutation({
  handler: async (ctx) => {
    // Get all users to assign as creators
    const users = await ctx.db.query("users").collect();
    const creators = users.filter(user => user.userType === "creator");

    if (creators.length === 0) {
      throw new Error("No creator users found. Please run seedUsers first.");
    }

    const createdIdeas = [];

    for (let i = 0; i < sampleBusinessIdeas.length; i++) {
      const ideaData = sampleBusinessIdeas[i];
      const creator = creators[i % creators.length]; // Cycle through creators

      const now = getRandomTimestamp(30);
      const ideaId = await ctx.db.insert("businessIdeas", {
        ...ideaData,
        creatorId: creator._id,
        currentFunding: getRandomCurrentFunding(ideaData.fundingGoal),
        status: "published" as const,
        createdAt: now,
        updatedAt: now,
      });
      createdIdeas.push(ideaId);
    }

    return { message: `Successfully created ${createdIdeas.length} business ideas`, ideaIds: createdIdeas };
  },
});

// Seed investment offers into the database
export const seedInvestmentOffers = mutation({
  handler: async (ctx) => {
    // Get all investor users
    const users = await ctx.db.query("users").collect();
    const investors = users.filter(user => user.userType === "investor");

    if (investors.length === 0) {
      throw new Error("No investor users found. Please run seedUsers first.");
    }

    const createdOffers = [];

    for (let i = 0; i < sampleInvestmentOffers.length; i++) {
      const offerData = sampleInvestmentOffers[i];
      const investor = investors[i % investors.length]; // Cycle through investors

      const now = getRandomTimestamp(30);
      const offerId = await ctx.db.insert("investmentOffers", {
        ...offerData,
        investorId: investor._id,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      createdOffers.push(offerId);
    }

    return { message: `Successfully created ${createdOffers.length} investment offers`, offerIds: createdOffers };
  },
});

// Seed all data at once
export const seedAllData = mutation({
  handler: async (ctx) => {
    try {
      // Clear existing data first (optional)
      const users = await ctx.db.query("users").collect();
      const ideas = await ctx.db.query("businessIdeas").collect();
      const offers = await ctx.db.query("investmentOffers").collect();

      for (const user of users) {
        await ctx.db.delete(user._id);
      }
      for (const idea of ideas) {
        await ctx.db.delete(idea._id);
      }
      for (const offer of offers) {
        await ctx.db.delete(offer._id);
      }

      const clearedCount = { users: users.length, ideas: ideas.length, offers: offers.length };

      // Create all users
      const userIds: any[] = [];
      for (const userData of sampleUsers) {
        const now = Date.now();
        const userId = await ctx.db.insert("users", {
          ...userData,
          createdAt: now,
          updatedAt: now,
        });
        userIds.push(userId);
      }

      // Get creators for business ideas (query again after creating users)
      const allUsersAfterCreation = await ctx.db.query("users").collect();
      const creators = allUsersAfterCreation.filter(user => user.userType === "creator");

      // Create all business ideas
      const ideaIds: any[] = [];
      for (let i = 0; i < sampleBusinessIdeas.length; i++) {
        const ideaData = sampleBusinessIdeas[i];
        const creator = creators[i % creators.length];

        const now = getRandomTimestamp(30);
        const ideaId = await ctx.db.insert("businessIdeas", {
          ...ideaData,
          creatorId: creator._id,
          currentFunding: getRandomCurrentFunding(ideaData.fundingGoal),
          status: "published" as const,
          createdAt: now,
          updatedAt: now,
        });
        ideaIds.push(ideaId);
      }

      // Create all investment offers
      const offerIds: any[] = [];
      const currentInvestors = allUsersAfterCreation.filter((user: any) => user.userType === "investor");

      for (let i = 0; i < sampleInvestmentOffers.length; i++) {
        const offerData = sampleInvestmentOffers[i];
        const investor = currentInvestors[i % currentInvestors.length];

        const now = getRandomTimestamp(30);
        const offerId = await ctx.db.insert("investmentOffers", {
          ...offerData,
          investorId: investor._id,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        offerIds.push(offerId);
      }

      // Create matches between ideas and offers
      const matchIds: any[] = [];
      for (let i = 0; i < sampleMatches.length && i < Math.min(ideaIds.length, offerIds.length); i++) {
        const matchData = sampleMatches[i];
        const ideaId = ideaIds[i % ideaIds.length];
        const offerId = offerIds[i % offerIds.length];
        const idea = await ctx.db.get(ideaId);
        const offer = await ctx.db.get(offerId);

        if (idea && offer && 'investorId' in offer && 'creatorId' in idea) {
          const now = getRandomTimestamp(20);
          const matchId = await ctx.db.insert("matches", {
            ideaId: ideaId,
            investorId: offer.investorId,
            creatorId: idea.creatorId,
            offerId: offerId,
            matchScore: matchData.matchScore,
            matchingFactors: matchData.matchingFactors,
            status: matchData.status,
            createdAt: now,
            updatedAt: now,
          });
          matchIds.push(matchId);
        }
      }

      return {
        message: "Successfully seeded all sample data",
        results: {
          cleared: { message: `Cleared ${clearedCount.users} users, ${clearedCount.ideas} ideas, and ${clearedCount.offers} offers` },
          users: { message: `Created ${userIds.length} users`, userIds },
          ideas: { message: `Created ${ideaIds.length} business ideas`, ideaIds },
          offers: { message: `Created ${offerIds.length} investment offers`, offerIds },
          matches: { message: `Created ${matchIds.length} matches`, matchIds },
        }
      };
    } catch (error) {
      throw new Error(`Failed to seed data: ${error}`);
    }
  },
});

// Clear all data (for testing/development)
export const clearAllData = mutation({
  handler: async (ctx) => {
    // Get all records
    const users = await ctx.db.query("users").collect();
    const ideas = await ctx.db.query("businessIdeas").collect();
    const offers = await ctx.db.query("investmentOffers").collect();

    // Delete all records
    for (const user of users) {
      await ctx.db.delete(user._id);
    }
    for (const idea of ideas) {
      await ctx.db.delete(idea._id);
    }
    for (const offer of offers) {
      await ctx.db.delete(offer._id);
    }

    return {
      message: `Cleared ${users.length} users, ${ideas.length} ideas, and ${offers.length} offers`
    };
  },
});