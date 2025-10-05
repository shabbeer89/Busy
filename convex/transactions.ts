import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new transaction
export const createTransaction = mutation({
  args: {
    matchId: v.id("matches"),
    investorId: v.id("users"),
    creatorId: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    paymentMethod: v.union(v.literal("crypto"), v.literal("bank_transfer")),
    walletAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("transactions", {
      ...args,
      status: "pending" as const,
      createdAt: now,
      confirmedAt: undefined,
    });
  },
});

// Get transaction by ID
export const getTransaction = query({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.transactionId);
  },
});

// Get transactions by match
export const getTransactionsByMatch = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .collect();
  },
});

// Get transactions by investor
export const getTransactionsByInvestor = query({
  args: { investorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_investor", (q) => q.eq("investorId", args.investorId))
      .collect();
  },
});

// Get transactions by creator
export const getTransactionsByCreator = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();
  },
});

// Update transaction status
export const updateTransactionStatus = mutation({
  args: {
    transactionId: v.id("transactions"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    cryptoTxHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const updateData: any = {
      status: args.status,
    };

    if (args.status === "confirmed" || args.status === "completed") {
      updateData.confirmedAt = now;
    }

    if (args.cryptoTxHash) {
      updateData.cryptoTxHash = args.cryptoTxHash;
    }

    return await ctx.db.patch(args.transactionId, updateData);
  },
});

// Get transactions by status
export const getTransactionsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Confirm crypto transaction
export const confirmCryptoTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.paymentMethod !== "crypto") {
      throw new Error("Transaction is not a crypto payment");
    }

    return await ctx.db.patch(args.transactionId, {
      status: "confirmed",
      cryptoTxHash: args.txHash,
      confirmedAt: Date.now(),
    });
  },
});

// Complete transaction (mark as fully completed)
export const completeTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status !== "confirmed") {
      throw new Error("Transaction must be confirmed before completion");
    }

    return await ctx.db.patch(args.transactionId, {
      status: "completed",
    });
  },
});

// Get transaction statistics for a user
export const getTransactionStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const transactions = user.userType === "investor"
      ? await ctx.db
          .query("transactions")
          .withIndex("by_investor", (q) => q.eq("investorId", args.userId))
          .collect()
      : await ctx.db
          .query("transactions")
          .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
          .collect();

    const stats = {
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === "completed").length,
      totalAmount: transactions
        .filter(t => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0),
      pendingTransactions: transactions.filter(t => t.status === "pending").length,
      failedTransactions: transactions.filter(t => t.status === "failed").length,
    };

    return stats;
  },
});

// Get recent transactions
export const getRecentTransactions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const transactions = user.userType === "investor"
      ? await ctx.db
          .query("transactions")
          .withIndex("by_investor", (q) => q.eq("investorId", args.userId))
          .collect()
      : await ctx.db
          .query("transactions")
          .withIndex("by_creator", (q) => q.eq("creatorId", args.userId))
          .collect();

    // Sort by creation date and limit results
    const limit = args.limit || 10;
    return transactions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
});