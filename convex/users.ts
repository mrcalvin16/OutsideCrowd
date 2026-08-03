import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";

type AuthIdentity = {
  subject: string;
  tokenIdentifier: string;
};

const attendeeInterestValidator = v.union(
  v.literal("music"),
  v.literal("nightlife"),
  v.literal("festivals"),
  v.literal("food"),
  v.literal("sports"),
  v.literal("networking"),
  v.literal("community"),
  v.literal("arts")
);

const notificationPreferenceValidator = v.union(
  v.literal("essential"),
  v.literal("email"),
  v.literal("text"),
  v.literal("email_and_text")
);

async function findCurrentUser(
  ctx: QueryCtx | MutationCtx,
  identity: AuthIdentity
) {
  const byTokenIdentifier = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (byTokenIdentifier) {
    return byTokenIdentifier;
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
}

export const updateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const existingUser = await findCurrentUser(
      ctx,
      identity
    );

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
      role: "attendee",
      onboardingComplete: false,
      attendeeOnboardingComplete: false,
      isOrganizer: false,
      verificationRequested: false,
      isVerifiedOrganizer: false,
    });
  },
});

export const completeAttendeeOnboarding = mutation({
  args: {
    name: v.string(),
    city: v.optional(v.string()),
    interests: v.array(attendeeInterestValidator),
    notificationPreference: notificationPreferenceValidator,
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const name = args.name.trim().slice(0, 100);
    const city = args.city?.trim().slice(0, 100);
    const interests = [...new Set(args.interests)];

    if (!name) {
      throw new Error("Enter your name to continue.");
    }

    if (interests.length > 8) {
      throw new Error("Choose up to eight interests.");
    }

    const existingUser = await findCurrentUser(
      ctx,
      identity
    );
    const now = Date.now();
    const attendeeProfile = {
      clerkId: identity.subject,
      userId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      email: identity.email?.trim().toLowerCase(),
      name,
      city: city || undefined,
      interests,
      notificationPreference: args.notificationPreference,
      attendeeOnboardingComplete: true,
      attendeeOnboardingCompletedAt: now,
      onboardingComplete: true,
      updatedAt: now,
    };

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        ...attendeeProfile,
        role: existingUser.isOrganizer
          ? existingUser.role ?? "organizer"
          : "attendee",
      });

      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      ...attendeeProfile,
      role: "attendee",
      createdAt: now,
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

    return await findCurrentUser(ctx, identity);
  },
});
