import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    if (identity.subject !== args.userId) {
      throw new Error(
        "You cannot update another user's profile."
      );
    }

    const existingByClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .first();

    const existingByUserId = existingByClerkId
      ? null
      : await ctx.db
          .query("users")
          .withIndex("by_userId", (q) =>
            q.eq("userId", identity.subject)
          )
          .first();

    const existingUser = existingByClerkId ?? existingByUserId;

    const patch = {
      clerkId: identity.subject,
      userId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      name: args.name.trim() || undefined,
      email: args.email.trim() || undefined,
      updatedAt: Date.now(),
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, patch);
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      ...patch,
      createdAt: Date.now(),
      onboardingComplete: false,
      isOrganizer: false,
      verificationRequested: false,
      isVerifiedOrganizer: false,
    });
  },
});

export const getCurrentUser = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const byClerkId = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .first();

    if (byClerkId) {
      return byClerkId;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.subject)
      )
      .first();
  },
});
