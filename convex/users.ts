import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    phoneNumber: v.optional(v.string()),
    userType: v.union(v.literal("creator"), v.literal("investor")),
    avatar: v.optional(v.string()),
    phoneVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { email, name, phoneNumber, userType, avatar, phoneVerified = false } = args;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check if phone number already exists (if provided)
    if (phoneNumber) {
      const existingPhoneUser = await ctx.db
        .query("users")
        .withIndex("by_phone", (q) => q.eq("phoneNumber", phoneNumber))
        .first();

      if (existingPhoneUser) {
        throw new Error("User with this phone number already exists");
      }
    }

    const now = Date.now();

    return await ctx.db.insert("users", {
      email,
      name,
      phoneNumber,
      userType,
      avatar,
      isVerified: false,
      phoneVerified,
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

// Verify user phone number
export const verifyPhone = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, {
      phoneVerified: true,
      updatedAt: Date.now(),
    });
  },
});

// Get user by phone number
export const getUserByPhone = query({
  args: { phoneNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_phone", (q) => q.eq("phoneNumber", args.phoneNumber))
      .first();
  },
});

// Get users by type (creators or investors)
export const getUsersByType = query({
  args: { userType: v.union(v.literal("creator"), v.literal("investor")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userType", (q) => q.eq("userType", args.userType))
      .collect();
  },
});

// Search users by name or email
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();

    const filteredUsers = users.filter(user =>
      user.name.toLowerCase().includes(args.query.toLowerCase()) ||
      user.email.toLowerCase().includes(args.query.toLowerCase())
    );

    return filteredUsers;
  },
});

// Find or create user by OAuth ID and email
export const findOrCreateUserByOAuth = mutation({
  args: {
    oauthId: v.string(),
    email: v.string(),
    name: v.string(),
    provider: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { oauthId, email, name, provider } = args;

    // First, try to find existing user by email
    let existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      // Update the user with OAuth information if not already set
      if (!existingUser.oauthId) {
        await ctx.db.patch(existingUser._id, {
          oauthId,
          provider,
          updatedAt: Date.now(),
        });
      }
      return existingUser._id;
    }

    // Create new user for OAuth
    const now = Date.now();
    const newUserId = await ctx.db.insert("users", {
      email,
      name,
      userType: "creator", // Default to creator, can be changed later
      isVerified: true, // OAuth users are typically verified
      oauthId,
      provider,
      createdAt: now,
      updatedAt: now,
    });

    return newUserId;
  },
});

// Get user by OAuth ID
export const getUserByOAuthId = query({
  args: { oauthId: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    return users.find(user => user.oauthId === args.oauthId) || null;
  },
});