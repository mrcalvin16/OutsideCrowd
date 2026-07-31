import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { classifyTrafficSource } from "./analyticsSources";
import { requireEventCapability } from "./eventAccess";

function cleanOptionalString(
  value: string | undefined,
  maximumLength: number
): string | undefined {
  const cleaned = value?.trim().slice(0, maximumLength);

  return cleaned || undefined;
}

export const trackEventView = mutation({
  args: {
    eventId: v.id("events"),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    path: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    const identity = await ctx.auth.getUserIdentity();
    const sessionId = cleanOptionalString(
      args.sessionId,
      128
    );
    const source = cleanOptionalString(args.source, 100);
    const referrer = cleanOptionalString(
      args.referrer,
      1_000
    );
    const path = cleanOptionalString(args.path, 500);

    if (sessionId) {
      const existing = await ctx.db
        .query("eventViews")
        .withIndex("by_event_and_sessionId", (q) =>
          q
            .eq("eventId", args.eventId)
            .eq("sessionId", sessionId)
        )
        .unique();

      if (existing) {
        return existing._id;
      }
    }

    return await ctx.db.insert("eventViews", {
      eventId: args.eventId,
      userId: identity?.tokenIdentifier,
      source: classifyTrafficSource(
        source,
        referrer
      ),
      referrer,
      path,
      sessionId,
      createdAt: Date.now(),
    });
  },
});

export const getEventViews = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    await requireEventCapability(
      ctx,
      args.eventId,
      "view_reports"
    );

    const views = await ctx.db
      .query("eventViews")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .take(1_000);

    return views.map((view) => ({
      source: classifyTrafficSource(
        view.source,
        view.referrer
      ),
      path: view.path,
      createdAt: view.createdAt,
    }));
  },
});
