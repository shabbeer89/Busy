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

// Sample messages for conversations - expanded for South Indian business context
const sampleConversationMessages = [
  [
    { content: "Namaste! I'm interested in your coconut processing automation in Kerala. The AI sorting technology sounds revolutionary.", type: "text", sender: "investor" },
    { content: "Thank you! We're revolutionizing traditional coconut processing in Alappuzha. Reduces manual labor by 80% while ensuring quality.", type: "text", sender: "creator" },
    { content: "Impressive ROI! I'd like to discuss investment. Are you open to ₹1.5 crore funding?", type: "text", sender: "investor" },
    { content: "Yes definitely! We're seeking ₹1.2 crores for 15% equity. Shall we schedule a call?", type: "text", sender: "creator" },
  ],
  [
    { content: "Hello! Your Madurai jasmine supply chain caught my attention. The blockchain traceability is interesting.", type: "text", sender: "investor" },
    { content: "Hi! We ensure fair pricing for Madurai's jasmine farmers through blockchain verification from flower to customer.", type: "text", sender: "creator" },
    { content: "What's your pre-money valuation? Interested in angel investment.", type: "text", sender: "investor" },
    { content: "₹4 crores pre-money. Seeking ₹45 lakhs. Can share our farmer network details!", type: "text", sender: "creator" },
  ],
  [
    { content: "Your textile recycling in Coimbatore looks promising. What's the waste processing capacity?", type: "text", sender: "investor" },
    { content: "Our technology converts 95% of Tamil Nadu textile waste back into usable fibers. Circular economy approach.", type: "text", sender: "creator" },
    { content: "Sustainable focus aligns with recent ESG mandates. Ready to invest ₹90 lakhs?", type: "text", sender: "investor" },
    { content: "Perfect! We'll expand to European export markets. Let's discuss partnership terms.", type: "text", sender: "creator" },
  ],
  [
    { content: "Bangalore medical tourism platform seems well-positioned. How do you handle visa processing?", type: "text", sender: "investor" },
    { content: "We provide end-to-end support: childcare during treatment, accommodation, and visa assistance for international patients.", type: "text", sender: "creator" },
    { content: "What's your expansion plan? Had cross-border healthcare experience.", type: "text", sender: "investor" },
    { content: "Targeting Middle East patients initially, then expanding to 15 Karnataka hospitals. Seeking ₹2 crores.", type: "text", sender: "creator" },
  ],
  [
    { content: "Kerala spice quality assurance system is innovative. How does AI detect adulteration?", type: "text", sender: "investor" },
    { content: "Our AI analyzes chemical composition and visual patterns to ensure Kozhikode spice authenticity.", type: "text", sender: "creator" },
    { content: "Export market potential is huge. Interested in providing ₹60 lakhs funding.", type: "text", sender: "investor" },
    { content: "Great! We'll focus on premium spice exports to Europe. Ready to share quality certificates!", type: "text", sender: "creator" },
  ],
  [
    { content: "Hyderabad AI research center looks promising. How will you commercialize healthcare diagnostics?", type: "text", sender: "investor" },
    { content: "Partnering with Telangana hospitals for AI-powered diagnosis. Focus on affordable solutions.", type: "text", sender: "creator" },
    { content: "Healthcare AI has huge potential. What's your technology roadmap?", type: "text", sender: "investor" },
    { content: "Two-year roadmap to deploy in 20 hospitals. Seeking ₹2.8 crores for 23% equity.", type: "text", sender: "creator" },
  ],
  [
    { content: "Chennai port logistics optimization will transform trade. What's the IoT implementation plan?", type: "text", sender: "investor" },
    { content: "Installing sensors across Chennai Port to track cargo movement and predict maintenance needs.", type: "text", sender: "creator" },
    { content: "Port efficiency will save millions in Tamil Nadu trade. Ready to invest ₹2.5 crores?", type: "text", sender: "investor" },
    { content: "Yes! We're offering 22% equity. Will integrate with existing port management systems.", type: "text", sender: "creator" },
  ],
  [
    { content: "Kerala backwater tourism AR/VR platform is creative. How does it drive bookings?", type: "text", sender: "investor" },
    { content: "Virtual tours of Alappuzha houseboats allow tourists to experience Kerala before booking.", type: "text", sender: "creator" },
    { content: "Tourism recovery needs innovation. What markets are you targeting?", type: "text", sender: "investor" },
    { content: "European and Middle East markets initially. Seeking ₹55 lakhs for platform development.", type: "text", sender: "creator" },
  ],
  [
    { content: "Tamil Nadu coffee processing automation addresses real pain points. What's your farmer network?", type: "text", sender: "investor" },
    { content: "Connected with 500 Coorg coffee farmers. Our AI ensures consistent quality for premium exports.", type: "text", sender: "creator" },
    { content: "Global coffee market values consistency. Interested in funding ₹1.3 crores.", type: "text", sender: "investor" },
    { content: "Perfect! We'll expand to Chikmagalur region too. Equity at 19% for the round.", type: "text", sender: "creator" },
  ],
  [
    { content: "Your Karnataka organic farming platform solves real market access issues. What's the commission structure?", type: "text", sender: "investor" },
    { content: "Farmers get 85% of sale price, platform takes 10%, logistics 5%. Direct farm-to-consumer model.", type: "text", sender: "creator" },
    { content: "Fair pricing will attract Bangalore consumers. How many farmers are you starting with?", type: "text", sender: "investor" },
    { content: "50 certified organic farmers initially, scaling to 200. Seeking ₹1.2 crores for platform.", type: "text", sender: "creator" },
  ]
];

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
      const creatorIndex = i % creators.length;
      const creatorId = creators[creatorIndex]; // Cycle through available creators

      if (!creatorId) {
        throw new Error(`No creator found for idea ${i}`);
      }

      const ideaData = {
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
        creatorId: creatorId as any, // Cast to bypass TypeScript strict typing
        status: "published" as const,
        createdAt: getRandomTimestamp(30),
        updatedAt: getRandomTimestamp(10),
        images: [`https://picsum.photos/seed/south-idea-${i}/800/600`],
        documents: [],
      };

      const ideaId = await ctx.db.insert("businessIdeas", ideaData);
      createdIdeas.push(ideaId);
    }

    // Seed investment offers
    const createdOffers: string[] = [];
    for (let i = 0; i < southIndianInvestmentOffers.length; i++) {
      const offer = southIndianInvestmentOffers[i];
      const investorIndex = i % investors.length;
      const investorId = investors[investorIndex]; // Cycle through available investors

      const offerId = await ctx.db.insert("investmentOffers", {
        ...offer,
        investorId: investorId as any, // Cast to bypass TypeScript strict typing
        isActive: Math.random() > 0.2, // 80% active
        createdAt: getRandomTimestamp(30),
        updatedAt: getRandomTimestamp(10),
      });
      createdOffers.push(offerId);
    }

    // Seed matches
    const createdMatches: string[] = [];
    for (let i = 0; i < southIndianMatches.length; i++) {
      const match = southIndianMatches[i];
      const ideaId = createdIdeas[i];
      const investorId = investors[i % investors.length];
      const creatorId = creators[i % creators.length];
      const offerId = createdOffers[i % createdOffers.length];

      // Get the actual idea and creator for this match
      const idea = await ctx.db.get(stringToId(ideaId));
      if (idea) {
        const matchId = await ctx.db.insert("matches", {
          ...match,
          ideaId: stringToId(ideaId),
          investorId: stringToId(investorId),
          creatorId: stringToId(creatorId),
          offerId: stringToId(offerId),
          createdAt: getRandomTimestamp(20),
          updatedAt: getRandomTimestamp(5),
        });
        createdMatches.push(matchId);
      }
    }

    // Seed conversations and messages for some matches
    for (let i = 0; i < Math.min(createdMatches.length, sampleConversationMessages.length); i++) {
      const matchId = createdMatches[i];
      const conversationMessages = sampleConversationMessages[i];
      const creatorId = creators[i];  // Use the creator from the loop
      const investorId = investors[i % investors.length];  // Use the investor from the loop

      // Create conversation
      const conversationId = await ctx.db.insert("conversations", {
        matchId: stringToId(matchId),
        participant1Id: stringToId(creatorId),
        participant2Id: stringToId(investorId),
        createdAt: getRandomTimestamp(15),
        updatedAt: getRandomTimestamp(5),
        lastMessageAt: getRandomTimestamp(5),
      });

      // Add messages to conversation
      let lastMessageId: string | null = null;
      for (let j = 0; j < conversationMessages.length; j++) {
        const msg = conversationMessages[j];
        const senderId = msg.sender === "investor" ? stringToId(investorId) : stringToId(creatorId);

        const messageId = await ctx.db.insert("messages", {
          conversationId: stringToId(conversationId),
          senderId: senderId,
          content: msg.content,
          type: msg.type as "text",
          read: Math.random() > 0.5, // Randomly mark as read/unread
          readAt: Math.random() > 0.5 ? getRandomTimestamp(10) : undefined,
          createdAt: getRandomTimestamp(15 - j * 2), // Older messages first
          updatedAt: getRandomTimestamp(15 - j * 2),
        });

        // Update conversation with last message for every other message
        if (j === conversationMessages.length - 1 || j % 2 === 1) {
          lastMessageId = messageId;
          await ctx.db.patch(stringToId(conversationId), {
            lastMessageId: stringToId(messageId),
            lastMessageAt: getRandomTimestamp(5),
            updatedAt: getRandomTimestamp(5),
          });
        }
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
