import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function getCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You must be signed in.");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q: any) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export const joinWaitingList = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const existing = await ctx.db
      .query("waitingList")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    if (existing) {
      throw new Error("You are already on the waiting list.");
    }

    return await ctx.db.insert("waitingList", {
      eventId: args.eventId,
      userId: user._id,
      createdAt: Date.now(),
    });
  },
});

export const getMyWaitingList = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      entries.map(async (entry) => {
        const event = await ctx.db.get(entry.eventId);

        const imageUrl = event?.imageStorageId
          ? await ctx.storage.getUrl(event.imageStorageId)
          : null;

        return {
          ...entry,
          event,
          imageUrl,
        };
      })
    );
  },
});

export const getWaitingListForEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("waitingList")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const sorted = entries.sort((a, b) => {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });

    return await Promise.all(
      sorted.map(async (entry, index) => {
        let waitlistUser = null;

        if (!String(entry.userId).startsWith("user_")) {
          waitlistUser = await ctx.db.get(entry.userId as any);
        }

        return {
          ...entry,
          user: waitlistUser,
          position: index + 1,
        };
      })
    );
  },
});

export const getMyWaitingListStatusForEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    if (!entry) {
      return null;
    }

    const allEntries = await ctx.db
      .query("waitingList")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const sorted = allEntries.sort((a, b) => {
      return (a.createdAt ?? 0) - (b.createdAt ?? 0);
    });

    const position = sorted.findIndex((item) => item._id === entry._id) + 1;

    return {
      ...entry,
      position,
    };
  },
});

export const leaveWaitingList = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const entry = await ctx.db
      .query("waitingList")
      .withIndex("by_event_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    if (!entry) {
      throw new Error("You are not on the waiting list.");
    }

    await ctx.db.delete(entry._id);
  },
});