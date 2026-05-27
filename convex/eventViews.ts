import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const trackEventView = mutation({
  args: {
    eventId: v.id("events"),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    path: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("eventViews", {
      eventId: args.eventId,
      source: args.source,
      referrer: args.referrer,
      path: args.path,
      createdAt: Date.now(),
    });
  },
});

export const getEventViews = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("eventViews")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});