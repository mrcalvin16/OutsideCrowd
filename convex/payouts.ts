import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function assertServerSecret(secret: string) {
  const expected = process.env.STRIPE_WEBHOOK_SHARED_SECRET;
  if (!expected || secret !== expected) throw new Error("Unauthorized server request.");
}

export const getConnectRecord = query({
  args: { serverSecret: v.string(), clerkId: v.string() },
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const user = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId)).first();
    return user ? { accountId: user.stripeConnectAccountId ?? null } : { accountId: null };
  },
});

export const saveConnectAccount = mutation({
  args: {
    serverSecret: v.string(),
    clerkId: v.string(),
    tokenIdentifier: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    accountId: v.string(),
  },
  handler: async (ctx, args) => {
    assertServerSecret(args.serverSecret);
    const existing = await ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId)).first();
    const patch = {
      clerkId: args.clerkId,
      userId: args.clerkId,
      tokenIdentifier: args.tokenIdentifier,
      email: args.email.trim().toLowerCase(),
      name: args.name?.trim(),
      stripeConnectAccountId: args.accountId,
      stripeConnectCreatedAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("users", {
      ...patch,
      createdAt: Date.now(),
      role: "organizer",
      isOrganizer: true,
      onboardingComplete: false,
      attendeeOnboardingComplete: false,
      verificationRequested: false,
      isVerifiedOrganizer: false,
    });
  },
});
