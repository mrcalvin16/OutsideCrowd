import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const isFollowingOrganizer = query({
  args: {
    organizerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return false;

    const existing = await ctx.db
      .query("followedOrganizers")
      .withIndex("by_user_organizer", (q) =>
        q
          .eq("userId", identity.subject)
          .eq("organizerUserId", args.organizerUserId)
      )
      .first();

    return !!existing;
  },
});

export const getFollowerCount = query({
  args: {
    organizerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const followers = await ctx.db
      .query("followedOrganizers")
      .withIndex("by_organizer", (q) =>
        q.eq("organizerUserId", args.organizerUserId)
      )
      .collect();

    return followers.length;
  },
});

export const toggleFollowOrganizer = mutation({
  args: {
    organizerUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (identity.subject === args.organizerUserId) {
      throw new Error("You cannot follow yourself.");
    }

    const existing = await ctx.db
      .query("followedOrganizers")
      .withIndex("by_user_organizer", (q) =>
        q
          .eq("userId", identity.subject)
          .eq("organizerUserId", args.organizerUserId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    }

    await ctx.db.insert("followedOrganizers", {
      userId: identity.subject,
      organizerUserId: args.organizerUserId,
      createdAt: Date.now(),
    });

    return { following: true };
  },
});
