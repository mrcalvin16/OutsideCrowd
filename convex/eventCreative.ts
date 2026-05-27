import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    try {
      return await ctx.db
        .query("eventCreative")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();
    } catch {
      return [];
    }
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return [];

      return await ctx.db
        .query("eventCreative")
        .withIndex("by_user", (q) => q.eq("userId", identity.subject))
        .collect();
    } catch {
      return [];
    }
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
    campaignStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    return await ctx.db.insert("eventCreative", {
      eventId: args.eventId,
      userId: identity?.subject ?? "guest",
      title: args.title ?? "AI-generated flyer",
      prompt: args.prompt ?? "",
      style: args.style ?? "Luxury",
      caption: args.caption ?? "",
      imageUrl: args.imageUrl ?? "",
      imageStorageId: args.imageStorageId,
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
      throw new Error("Creative not found");
    }

    return await ctx.db.insert("eventCreative", {
      eventId: item.eventId,
      userId: item.userId,
      title: `${item.title || "Creative"} Copy`,
      prompt: item.prompt,
      style: item.style,
      caption: item.caption,
      imageStorageId: item.imageStorageId,
      imageUrl: item.imageUrl,
      sourceEventId: item.sourceEventId,
      createdAt: Date.now(),
    });
  },
});


export const getById = query({
  args: {
    id: v.id("eventCreative"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
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
    campaignStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;

    await ctx.db.patch(id, {
      ...patch,
    });

    return { success: true };
  },
});


export const updateStatus = mutation({
  args: {
    id: v.id("eventCreative"),
    campaignStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      campaignStatus: args.campaignStatus,
    });

    return { success: true };
  },
});
