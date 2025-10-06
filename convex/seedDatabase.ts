import { v } from "convex/values";
import { mutation } from "./_generated/server";
import {
  southIndianInvestors,
  southIndianCreators,
  southIndianBusinessIdeas,
  southIndianInvestmentOffers,
  southIndianMatches,
  southIndianTransactions,
  southIndianFavorites,
  getRandomTimestamp,
  getRandomCurrentFunding
} from "./seedData";

// Helper function to convert string to Id
function stringToId(id: string) {
  return id as any;
}

export const seedSouthIndianData = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data
    const existingUsers = await ctx.db.query("users").collect();
    const existingIdeas = await ctx.db.query("businessIdeas").collect();
    const existingOffers = await ctx.db.query("investmentOffers").collect();
    const existingMatches = await ctx.db.query("matches").collect();
    const existingTransactions = await ctx.db.query("transactions").collect();
    const existingFavorites = await ctx.db.query("favorites").collect();

    // Delete existing records
    for (const user of existingUsers) {
      await ctx.db.delete(user._id);
    }
    for (const idea of existingIdeas) {
      await ctx.db.delete(idea._id);
    }
    for (const offer of existingOffers) {
      await ctx.db.delete(offer._id);
    }
    for (const match of existingMatches) {
      await ctx.db.delete(match._id);
    }
    for (const transaction of existingTransactions) {
      await ctx.db.delete(transaction._id);
    }
    for (const favorite of existingFavorites) {
      await ctx.db.delete(favorite._id);
    }

    // Seed users (investors and creators)
    const createdUsers: string[] = [];
    const investors: string[] = [];
    const creators: string[] = [];

    for (let i = 0; i < southIndianInvestors.length; i++) {
      const investor = southIndianInvestors[i];
      const userId = await ctx.db.insert("users", {
        ...investor,
        createdAt: getRandomTimestamp(30),
        updatedAt: getRandomTimestamp(10),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=south-investor-${i}`,
      });
      createdUsers.push(userId);
      investors.push(userId);
    }

    for (let i = 0; i < southIndianCreators.length; i++) {
      const creator = southIndianCreators[i];
      const userId = await ctx.db.insert("users", {
        ...creator,
        createdAt: getRandomTimestamp(30),
        updatedAt: getRandomTimestamp(10),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=south-creator-${i}`,
      });
      createdUsers.push(userId);
      creators.push(userId);
    }

    // Seed business ideas
    const createdIdeas: string[] = [];
    for (let i = 0; i < southIndianBusinessIdeas.length; i++) {
      const idea = southIndianBusinessIdeas[i];
      const creatorId = creators[i];
      const ideaId = await ctx.db.insert("businessIdeas", {
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tags: idea.tags,
        fundingGoal: idea.fundingGoal,
        currentFunding: getRandomCurrentFunding(idea.fundingGoal),
        equityOffered: idea.equityOffered,
        valuation: idea.valuation,
        stage: idea.stage,
        timeline: idea.timeline,
        teamSize: idea.teamSize,
        creatorId: stringToId(creatorId),
        status: "published" as const,
        createdAt: getRandomTimestamp(30),
        updatedAt: getRandomTimestamp(10),
        images: [`https://picsum.photos/seed/south-idea-${i}/800/600`],
        documents: [],
      });
      createdIdeas.push(ideaId);
    }

    // Seed investment offers
    const createdOffers: string[] = [];
    for (let i = 0; i < southIndianInvestmentOffers.length; i++) {
      const offer = southIndianInvestmentOffers[i];
      const investorId = investors[i];
      const offerId = await ctx.db.insert("investmentOffers", {
        ...offer,
        investorId: stringToId(investorId),
        isActive: Math.random() > 0.2, // 80% active
        createdAt: getRandomTimestamp(30),
        updatedAt: getRandomTimestamp(10),
      });
      createdOffers.push(offerId);
    }

    // Seed matches
    for (let i = 0; i < southIndianMatches.length; i++) {
      const match = southIndianMatches[i];
      const ideaId = createdIdeas[i];
      const investorId = investors[i % investors.length];
      const creatorId = creators[i % creators.length];
      const offerId = createdOffers[i % createdOffers.length];

      // Get the actual idea and creator for this match
      const idea = await ctx.db.get(stringToId(ideaId));
      if (idea) {
        await ctx.db.insert("matches", {
          ...match,
          ideaId: stringToId(ideaId),
          investorId: stringToId(investorId),
          creatorId: stringToId(creatorId),
          offerId: stringToId(offerId),
          createdAt: getRandomTimestamp(20),
          updatedAt: getRandomTimestamp(5),
        });
      }
    }

    // Seed transactions for successful matches
    for (let i = 0; i < southIndianTransactions.length; i++) {
      const transaction = southIndianTransactions[i];
      const match = await ctx.db.query("matches")
        .filter(q => q.eq(q.field("status"), "invested"))
        .first();

      if (match) {
        await ctx.db.insert("transactions", {
          ...transaction,
          matchId: match._id,
          investorId: match.investorId,
          creatorId: match.creatorId,
          createdAt: getRandomTimestamp(15),
          confirmedAt: transaction.status === "completed" ? getRandomTimestamp(10) : undefined,
          walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
        });
      }
    }

    // Seed favorites
    for (let i = 0; i < southIndianFavorites.length; i++) {
      const favorite = southIndianFavorites[i];
      const userId = createdUsers[i % createdUsers.length];
      const itemId = i % 2 === 0 ?
        createdOffers[i % createdOffers.length] :
        createdIdeas[i % createdIdeas.length];

      await ctx.db.insert("favorites", {
        ...favorite,
        userId: stringToId(userId),
        itemId,
        createdAt: getRandomTimestamp(25),
      });
    }

    return {
      message: "South Indian data seeded successfully!",
      stats: {
        users: createdUsers.length,
        ideas: createdIdeas.length,
        offers: createdOffers.length,
        matches: southIndianMatches.length,
        transactions: southIndianTransactions.length,
        favorites: southIndianFavorites.length,
      }
    };
  },
});

export const getSeedingStats = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const ideas = await ctx.db.query("businessIdeas").collect();
    const offers = await ctx.db.query("investmentOffers").collect();
    const matches = await ctx.db.query("matches").collect();
    const transactions = await ctx.db.query("transactions").collect();
    const favorites = await ctx.db.query("favorites").collect();

    return {
      users: users.length,
      ideas: ideas.length,
      offers: offers.length,
      matches: matches.length,
      transactions: transactions.length,
      favorites: favorites.length,
    };
  },
});