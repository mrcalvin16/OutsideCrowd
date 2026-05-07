import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * JOIN WAITLIST
 */
export const join = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const existing = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const alreadyExists = existing.find(
      (e) => e.eventId === eventId
    );

    if (alreadyExists) {
      return { alreadyJoined: true };
    }

    await ctx.db.insert("waitingList", {
      eventId,
      userId,
      status: "waiting",
    });

    return { success: true };
  },
});

/**
 * GET POSITION
 */
export const position = query({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
  },
  handler: async (ctx, { eventId, userId }) => {
    const all = await ctx.db
      .query("waitingList")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();

    const sorted = all.sort(
      (a, b) => a._creationTime - b._creationTime
    );

    const index = sorted.findIndex(
      (e) => e.userId === userId
    );

    return index === -1
      ? null
      : {
          position: index + 1,
        };
  },
});

/**
 * CLEANUP EXPIRED OFFERS
 */
export const cleanupExpiredOffers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const offers = await ctx.db.query("waitingList").collect();

    for (const offer of offers) {
      if (
        offer.status === "offered" &&
        offer.offerExpiresAt &&
        offer.offerExpiresAt < now
      ) {
        await ctx.db.patch(offer._id, {
          status: "expired",
        });
      }
    }
  },
});