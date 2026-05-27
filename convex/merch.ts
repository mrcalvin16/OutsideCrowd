import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),

    name: v.string(),
    description: v.optional(v.string()),

    price: v.float64(),

    inventory: v.optional(v.float64()),
    sizes: v.optional(v.array(v.string())),

    featured: v.optional(v.boolean()),
    limitedDrop: v.optional(v.boolean()),
    pickupAtEvent: v.optional(v.boolean()),
    isPreorder: v.optional(v.boolean()),

    imageStorageId: v.optional(v.id("_storage")),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const imageUrl = args.imageStorageId
      ? await ctx.storage.getUrl(args.imageStorageId)
      : undefined;

    return await ctx.db.insert("merch", {
      eventId: args.eventId,

      organizerId: identity.subject,

      name: args.name,
      description: args.description,

      price: args.price,
      inventory: args.inventory,
      sizes: args.sizes ?? [],

      imageStorageId: args.imageStorageId,
      imageUrl: imageUrl ?? undefined,

      featured: args.featured ?? false,
      limitedDrop: args.limitedDrop ?? false,
      pickupAtEvent: args.pickupAtEvent ?? false,

      isActive: true,
      isPreorder: args.isPreorder ?? false,

      createdAt: Date.now(),
    });
  },
});

export const getByEvent = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("merch")
      .withIndex("by_eventId", (q) =>
        q.eq("eventId", args.eventId)
      )
      .collect();
  },
});

export const updateMerch = mutation({
  args: {
    merchId: v.id("merch"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.float64()),
    inventory: v.optional(v.float64()),
    sizes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
    isPreorder: v.optional(v.boolean()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const merch = await ctx.db.get(args.merchId);

    if (!merch) {
      throw new Error("Merch item not found.");
    }

    const event = await ctx.db.get(merch.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.userId !== identity.subject && event.organizerId !== identity.subject) {
      throw new Error("You do not have permission to edit this merch.");
    }

    const { merchId, ...updates } = args;

    await ctx.db.patch(merchId, updates);

    return true;
  },
});

export const deleteMerch = mutation({
  args: {
    merchId: v.id("merch"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const merch = await ctx.db.get(args.merchId);

    if (!merch) {
      throw new Error("Merch item not found.");
    }

    const event = await ctx.db.get(merch.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.userId !== identity.subject && event.organizerId !== identity.subject) {
      throw new Error("You do not have permission to delete this merch.");
    }

    await ctx.db.delete(args.merchId);

    return true;
  },
});

export const getById = query({
  args: {
    merchId: v.id("merch"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.merchId);

    if (!item) {
      return null;
    }

    const imageUrl = item.imageStorageId
      ? await ctx.storage.getUrl(item.imageStorageId)
      : item.imageUrl ?? null;

    return {
      ...item,
      imageUrl,
    };
  },
});
