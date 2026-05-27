import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByEvent = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("ticketTypes")
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

    perks: v.optional(v.array(v.string())),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("ticketTypes", {
      ...args,
      sold: 0,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),

    name: v.optional(v.string()),
    description: v.optional(v.string()),

    price: v.optional(v.float64()),

    quantity: v.optional(v.float64()),

    perks: v.optional(v.array(v.string())),

    isActive: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const { ticketTypeId, ...rest } = args;

    await ctx.db.patch(ticketTypeId, rest);

    return true;
  },
});

export const remove = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },

  handler: async (ctx, args) => {
    await ctx.db.delete(args.ticketTypeId);

    return true;
  },
});


export const toggleSoldOut = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found.");

    await ctx.db.patch(args.ticketTypeId, {
      isSoldOut: !(ticketType.isSoldOut ?? false),
    });

    return true;
  },
});

export const toggleSalesPaused = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, args) => {
    const ticketType = await ctx.db.get(args.ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found.");

    await ctx.db.patch(args.ticketTypeId, {
      salesPaused: !(ticketType.salesPaused ?? false),
    });

    return true;
  },
});
