import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireEventCapability } from "./eventAccess";

const campaignStatusValidator = v.union(
  v.literal("draft"),
  v.literal("ready"),
  v.literal("posted")
);

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireEventCapability(
      ctx,
      args.eventId,
      "manage_marketing"
    );

    const creatives = await ctx.db
      .query("eventCreative")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId)
      )
      .take(200);

    return creatives.sort(
      (a, b) =>
        (b.updatedAt ?? b.createdAt ?? b._creationTime) -
        (a.updatedAt ?? a.createdAt ?? a._creationTime)
    );
  },
});

export const listPublishedByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const creatives = await ctx.db
      .query("eventCreative")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId)
      )
      .take(100);

    return creatives
      .filter(
        (creative) =>
          creative.campaignStatus === "posted"
      )
      .sort(
        (a, b) =>
          (b.updatedAt ??
            b.createdAt ??
            b._creationTime) -
          (a.updatedAt ??
            a.createdAt ??
            a._creationTime)
      );
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const creatives = await ctx.db
      .query("eventCreative")
      .withIndex("by_user", (q) =>
        q.eq("userId", identity.subject)
      )
      .take(200);

    return creatives.sort(
      (a, b) =>
        (b.updatedAt ?? b.createdAt ?? b._creationTime) -
        (a.updatedAt ?? a.createdAt ?? a._creationTime)
    );
  },
});

export const saveCreative = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    prompt: v.optional(v.string()),
    style: v.optional(v.string()),
    caption: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageBase64: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    sourceEventId: v.optional(v.string()),
    campaignStatus: v.optional(campaignStatusValidator),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireEventCapability(
      ctx,
      args.eventId,
      "manage_marketing"
    );

    return await ctx.db.insert("eventCreative", {
      eventId: args.eventId,
      userId: identity.subject,
      title: args.title ?? "AI-generated flyer",
      prompt: args.prompt ?? "",
      style: args.style ?? "Luxury",
      caption: args.caption ?? "",
      imageUrl: args.imageUrl ?? "",
      imageStorageId: args.imageStorageId,
      sourceEventId: args.sourceEventId,
      campaignStatus: args.campaignStatus ?? "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const create = saveCreative;


export const remove = mutation({
  args: {
    id: v.id("eventCreative"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);

    if (!item) {
      throw new Error("Creative not found.");
    }

    await requireEventCapability(
      ctx,
      item.eventId,
      "manage_marketing"
    );
    await ctx.db.delete(args.id);
    return { success: true };
  },
});


export const duplicate = mutation({
  args: {
    id: v.id("eventCreative"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) {
      throw new Error("Creative not found.");
    }

    const { identity } = await requireEventCapability(
      ctx,
      item.eventId,
      "manage_marketing"
    );

    return await ctx.db.insert("eventCreative", {
      eventId: item.eventId,
      userId: identity.subject,
      title: `${item.title || "Creative"} Copy`,
      prompt: item.prompt,
      style: item.style,
      caption: item.caption,
      imageStorageId: item.imageStorageId,
      imageUrl: item.imageUrl,
      sourceEventId: item.sourceEventId,
      campaignStatus: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});


export const getById = query({
  args: {
    id: v.id("eventCreative"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);

    if (!item) {
      return null;
    }

    await requireEventCapability(
      ctx,
      item.eventId,
      "manage_marketing"
    );

    return item;
  },
});


export const updateCreative = mutation({
  args: {
    id: v.id("eventCreative"),
    title: v.optional(v.string()),
    prompt: v.optional(v.string()),
    style: v.optional(v.string()),
    caption: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    sourceEventId: v.optional(v.string()),
    campaignStatus: v.optional(campaignStatusValidator),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    const item = await ctx.db.get(id);

    if (!item) {
      throw new Error("Creative not found.");
    }

    await requireEventCapability(
      ctx,
      item.eventId,
      "manage_marketing"
    );

    await ctx.db.patch(id, {
      ...patch,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});


export const updateStatus = mutation({
  args: {
    id: v.id("eventCreative"),
    campaignStatus: campaignStatusValidator,
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);

    if (!item) {
      throw new Error("Creative not found.");
    }

    await requireEventCapability(
      ctx,
      item.eventId,
      "manage_marketing"
    );

    await ctx.db.patch(args.id, {
      campaignStatus: args.campaignStatus,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
