import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add item to favorites
export const addToFavorites = mutation({
  args: {
    itemId: v.string(),
    itemType: v.union(v.literal("offer"), v.literal("idea")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }

    // Get user from our users table using email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", user._id).eq("itemId", args.itemId).eq("itemType", args.itemType)
      )
      .unique();

    if (existing) {
      throw new Error("Item already in favorites");
    }

    // Add to favorites
    const favoriteId = await ctx.db.insert("favorites", {
      userId: user._id,
      itemId: args.itemId,
      itemType: args.itemType,
      createdAt: Date.now(),
    });

    return { success: true, favoriteId };
  },
});

// Remove item from favorites
export const removeFromFavorites = mutation({
  args: {
    itemId: v.string(),
    itemType: v.union(v.literal("offer"), v.literal("idea")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated");
    }

    // Get user from our users table using email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Find and remove the favorite
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", user._id).eq("itemId", args.itemId).eq("itemType", args.itemType)
      )
      .unique();

    if (!favorite) {
      throw new Error("Favorite not found");
    }

    await ctx.db.delete(favorite._id);

    return { success: true };
  },
});

// Get user's favorites
export const getUserFavorites = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      return [];
    }

    // Get user from our users table using email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      return [];
    }

    // Get all user favorites
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return favorites;
  },
});

// Check if item is favorited by user
export const isFavorited = query({
  args: {
    itemId: v.string(),
    itemType: v.union(v.literal("offer"), v.literal("idea")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      return false;
    }

    // Get user from our users table using email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      return false;
    }

    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_item", (q) =>
        q.eq("userId", user._id).eq("itemId", args.itemId).eq("itemType", args.itemType)
      )
      .unique();

    return !!favorite;
  },
});

// Get favorited offers with details
export const getFavoritedOffers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      return [];
    }

    // Get user from our users table using email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      return [];
    }

    // Get user's favorited offers
    const offerFavorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("itemType"), "offer"))
      .collect();

    // Get offer details for each favorite
    const offersWithDetails = await Promise.all(
      offerFavorites.map(async (favorite) => {
        const offer = await ctx.db.get(favorite.itemId as any);
        if (!offer) return null;

        return {
          ...offer,
          favoriteId: favorite._id,
          favoritedAt: favorite.createdAt,
        };
      })
    );

    return offersWithDetails.filter(Boolean);
  },
});

// Get favorited ideas with details
export const getFavoritedIdeas = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      return [];
    }

    // Get user from our users table using email from identity
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (!user) {
      return [];
    }

    // Get user's favorited ideas
    const ideaFavorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("itemType"), "idea"))
      .collect();

    // Get idea details for each favorite
    const ideasWithDetails = await Promise.all(
      ideaFavorites.map(async (favorite) => {
        const idea = await ctx.db.get(favorite.itemId as any);
        if (!idea) return null;

        return {
          ...idea,
          favoriteId: favorite._id,
          favoritedAt: favorite.createdAt,
        };
      })
    );

    return ideasWithDetails.filter(Boolean);
  },
});