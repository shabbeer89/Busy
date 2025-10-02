import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    userType: v.union(v.literal("creator"), v.literal("investor")),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { email, name, userType, avatar } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const now = Date.now();

    return await ctx.db.insert("users", {
      email,
      name,
      userType,
      avatar,
      isVerified: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get current user by email
export const getCurrentUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Get user by ID
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      avatar: v.optional(v.string()),
      bio: v.optional(v.string()),
      location: v.optional(v.string()),
      website: v.optional(v.string()),
      socialLinks: v.optional(v.object({
        linkedin: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })),
      // Creator specific
      companyName: v.optional(v.string()),
      industry: v.optional(v.string()),
      experience: v.optional(v.string()),
      // Investor specific
      investmentRange: v.optional(v.object({
        min: v.number(),
        max: v.number(),
      })),
      preferredIndustries: v.optional(v.array(v.string())),
      riskTolerance: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    }),
  },
  handler: async (ctx, args) => {
    const { userId, updates } = args;

    return await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Get all users (for admin/debugging purposes)
export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Verify user email
export const verifyUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      isVerified: true,
      updatedAt: Date.now(),
    });
  },
});