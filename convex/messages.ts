import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get or create a conversation for a match between two users
export const getOrCreateConversation = mutation({
  args: {
    matchId: v.id("matches"),
    participant1Id: v.id("users"),
    participant2Id: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Normalize participants to avoid duplicate conversations
    const participants = [args.participant1Id, args.participant2Id].sort((a, b) => a.localeCompare(b));
    const participant1Id = participants[0];
    const participant2Id = participants[1];

    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) =>
        q.eq("participant1Id", participant1Id).eq("participant2Id", participant2Id)
      )
      .first();

    if (existing) {
      return existing;
    }

    // Create new conversation
    const conversationId = await ctx.db.insert("conversations", {
      matchId: args.matchId,
      participant1Id,
      participant2Id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return await ctx.db.get(conversationId);
  },
});

// Get all conversations for a user (accepts any string for OAuth compatibility)
export const getConversationsForUser = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Try to find user by OAuth ID first
    let user = await ctx.db
      .query("users")
      .withIndex("by_oauth", (q) => q.eq("oauthId", args.userId))
      .first();

    // If not found by OAuth ID, try direct Convex ID
    if (!user) {
      try {
        user = await ctx.db.get(args.userId as Id<"users">);
      } catch {
        // Ignore conversion error
      }
    }

    if (!user) return [];

    const actualUserId = user._id;

    // Get all conversations where user is either participant1 or participant2
    const conversations1 = await ctx.db
      .query("conversations")
      .withIndex("by_participant1", (q) => q.eq("participant1Id", actualUserId))
      .collect();

    const conversations2 = await ctx.db
      .query("conversations")
      .withIndex("by_participant2", (q) => q.eq("participant2Id", actualUserId))
      .collect();

    const allConversations = [...conversations1, ...conversations2];

    // Get the other user and last message for each conversation
    const conversationsWithDetails = await Promise.all(
      allConversations.map(async (conversation) => {
        const otherUserId =
          conversation.participant1Id === actualUserId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherUser = await ctx.db.get(otherUserId);
        const lastMessage = conversation.lastMessageId
          ? await ctx.db.get(conversation.lastMessageId)
          : null;

        // Count unread messages
        const unreadCount = await ctx.db
          .query("messages")
          .filter((q) => q.eq(q.field("conversationId"), conversation._id))
          .filter((q) => q.eq(q.field("read"), false))
          .filter((q) => q.neq(q.field("senderId"), actualUserId))
          .collect()
          .then(messages => messages.length);

        return {
          ...conversation,
          otherUser: {
            id: otherUser!._id,
            name: otherUser!.name,
            avatar: otherUser!.avatar,
            userType: otherUser!.userType,
          },
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message time (most recent first)
    return conversationsWithDetails.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt;
      const bTime = b.lastMessage?.createdAt || b.createdAt;
      return bTime - aTime;
    });
  },
});

// Send a message in a conversation
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("system"))),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      type: args.type || "text",
      read: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const message = await ctx.db.get(messageId);

    // Update conversation with last message
    await ctx.db.patch(args.conversationId, {
      lastMessageId: messageId,
      lastMessageAt: Date.now(),
      updatedAt: Date.now(),
    });

    return message;
  },
});

// Get messages for a conversation
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation_created", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    // Messages are already sorted by createdAt ascending due to the index
    return messages;
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("read"), false))
      .filter((q) => q.neq(q.field("senderId"), args.userId))
      .collect();

    const updates = unreadMessages.map(message =>
      ctx.db.patch(message._id, {
        read: true,
        readAt: Date.now(),
      })
    );

    await Promise.all(updates);

    return { markedCount: unreadMessages.length };
  },
});

// Get total unread count for a user
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all conversations where user is either participant
    const conversations1 = await ctx.db
      .query("conversations")
      .withIndex("by_participant1", (q) => q.eq("participant1Id", args.userId))
      .collect();

    const conversations2 = await ctx.db
      .query("conversations")
      .withIndex("by_participant2", (q) => q.eq("participant2Id", args.userId))
      .collect();

    const allConversations = [...conversations1, ...conversations2];
    let totalUnread = 0;

    for (const conversation of allConversations) {
      const unreadCount = await ctx.db
        .query("messages")
        .filter((q) => q.eq(q.field("conversationId"), conversation._id))
        .filter((q) => q.eq(q.field("read"), false))
        .filter((q) => q.neq(q.field("senderId"), args.userId))
        .collect()
        .then(messages => messages.length);

      totalUnread += unreadCount;
    }

    return totalUnread;
  },
});

// Get conversation by match ID
export const getConversationByMatch = query({
  args: {
    matchId: v.id("matches"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_match", (q) => q.eq("matchId", args.matchId))
      .first();

    if (!conversation) return null;

    const otherUserId =
      conversation.participant1Id === args.userId
        ? conversation.participant2Id
        : conversation.participant1Id;

    const otherUser = await ctx.db.get(otherUserId);

    return {
      ...conversation,
      otherUser: {
        id: otherUser!._id,
        name: otherUser!.name,
        avatar: otherUser!.avatar,
        userType: otherUser!.userType,
      },
    };
  },
});
