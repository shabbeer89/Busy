import { v } from "convex/values";
import { query } from "./_generated/server";

// Get platform-wide analytics statistics
export const getPlatformStats = query({
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    // Get user type counts
    const creators = users.filter(user => user.userType === "creator").length;
    const investors = users.filter(user => user.userType === "investor").length;

    // Get all business ideas
    const ideas = await ctx.db.query("businessIdeas").collect();
    const publishedIdeas = ideas.filter(idea => idea.status === "published");

    // Get all investment offers
    const offers = await ctx.db.query("investmentOffers").collect();

    // Get all matches
    const matches = await ctx.db.query("matches").collect();

    // Get all completed transactions for funding calculations
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();
    const totalFunding = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Get unique categories from published ideas
    const categories = [...new Set(publishedIdeas.map(idea => idea.category))];

    // Calculate recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentIdeas = publishedIdeas.filter(idea => (idea.createdAt || 0) > thirtyDaysAgo).length;
    const recentOffers = offers.filter(offer => (offer.createdAt || 0) > thirtyDaysAgo).length;
    const recentMatches = matches.filter(match => (match.createdAt || 0) > thirtyDaysAgo).length;
    const recentInvestments = transactions.filter(t => (t.createdAt || 0) > thirtyDaysAgo).length;

    // Calculate average match score
    const matchScores = matches.map(match => match.matchScore || 0);
    const averageMatchScore = matchScores.length > 0
      ? Math.round(matchScores.reduce((sum, score) => sum + score, 0) / matchScores.length)
      : 0;

    return {
      totalUsers: users.length,
      totalCreators: creators,
      totalInvestors: investors,
      totalIdeas: publishedIdeas.length,
      totalOffers: offers.length,
      totalMatches: matches.length,
      totalInvestments: transactions.length,
      totalFunding,
      averageMatchScore,
      topIndustries: categories.slice(0, 5), // Top 5 categories
      recentActivity: {
        newIdeas: recentIdeas,
        newOffers: recentOffers,
        newMatches: recentMatches,
        newInvestments: recentInvestments,
      },
    };
  },
});

// Get user-specific dashboard statistics
export const getUserDashboardStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Get user's matches using creator index (for creators) or investor index (for investors)
    const matches = user.userType === 'creator'
      ? await ctx.db
          .query("matches")
          .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
          .collect()
      : await ctx.db
          .query("matches")
          .withIndex("by_investor", (q) => q.eq("investorId", args.userId))
          .collect();

    // Get user's ideas (for creators)
    const ideas = await ctx.db
      .query("businessIdeas")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .collect();

    // Get user's offers (for investors)
    const offers = await ctx.db
      .query("investmentOffers")
      .withIndex("by_investor", (q) => q.eq("investorId", args.userId))
      .collect();

    // Get user's transactions as creator or investor
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
      .collect();

    const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivity: Array<{
      id: string;
      type: 'match' | 'view' | 'message' | 'investment';
      title: string;
      description: string;
      timestamp: string;
      amount?: number;
    }> = [];

    // Recent matches
    const recentMatches = matches.filter(match => (match.createdAt || 0) > sevenDaysAgo);
    recentMatches.forEach(match => {
      // Get investment amount from transactions if match is invested
      const investmentAmount = match.status === 'invested'
        ? transactions.find(t => t.matchId === match._id)?.amount
        : undefined;

      recentActivity.push({
        id: `match_${match._id}`,
        type: 'match' as const,
        title: user.userType === 'creator' ? 'New Match Found' : 'New Investment Opportunity',
        description: user.userType === 'creator'
          ? `Your idea matched with an investor`
          : `New business idea matches your criteria`,
        timestamp: formatTimeAgo(match.createdAt || Date.now()),
        amount: investmentAmount,
      });
    });

    // Recent profile views (simulated for now - would need a views table)
    const profileViews = Math.floor(Math.random() * 50) + 10;

    // Calculate success rate based on matches and completed investments
    const successRate = matches.length > 0
      ? Math.floor((matches.filter(m => m.status === 'invested').length / matches.length) * 100)
      : 0;

    // Calculate response rate (simulated - would need message tracking)
    const responseRate = Math.floor(Math.random() * 20) + 75;

    return {
      totalMatches: matches.length,
      activeOffers: user.userType === 'investor' ? offers.length : 0,
      totalEarnings,
      profileViews,
      responseRate,
      successRate,
      recentActivity: recentActivity.slice(0, 4),
    };
  },
});

// Get real-time platform statistics for homepage
export const getRealtimeStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const onlineUsers = Math.floor(users.length * 0.15); // Simulate 15% online

    return {
      onlineUsers,
      activeIdeas: await ctx.db
        .query("businessIdeas")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect()
        .then(ideas => ideas.length),
      recentMatches: await ctx.db
        .query("matches")
        .collect()
        .then(matches => matches.filter(m => (m.createdAt || 0) > Date.now() - (24 * 60 * 60 * 1000)).length),
    };
  },
});

// Get dynamic categories from published ideas
export const getAvailableCategories = query({
  handler: async (ctx) => {
    const ideas = await ctx.db
      .query("businessIdeas")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const categories = [...new Set(ideas.map(idea => idea.category))];
    return categories.sort();
  },
});

// Helper function to format time ago
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
}
