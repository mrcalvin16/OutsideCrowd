import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByEvent = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketAddOns")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),

    name: v.string(),
    description: v.optional(v.string()),

    price: v.float64(),

    quantity: v.optional(v.float64()),

    isRequired: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("ticketAddOns", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    addOnId: v.id("ticketAddOns"),

    name: v.optional(v.string()),
    description: v.optional(v.string()),

    price: v.optional(v.float64()),

    quantity: v.optional(v.float64()),

    isRequired: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const { addOnId, ...rest } = args;

    await ctx.db.patch(addOnId, rest);

    return true;
  },
});

export const remove = mutation({
  args: {
    addOnId: v.id("ticketAddOns"),
  },

  handler: async (ctx, args) => {
    await ctx.db.delete(args.addOnId);

    return true;
  },
});


export const toggleSoldOut = mutation({
  args: {
    addOnId: v.id("ticketAddOns"),
  },
  handler: async (ctx, args) => {
    const addOn = await ctx.db.get(args.addOnId);
    if (!addOn) throw new Error("Add-on not found.");

    await ctx.db.patch(args.addOnId, {
      isSoldOut: !(addOn.isSoldOut ?? false),
    });

    return true;
  },
});
