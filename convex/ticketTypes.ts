import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireEventCapability } from "./eventAccess";

async function requireTicketTypeAccess(
  ctx: MutationCtx,
  ticketTypeId: Id<"ticketTypes">
) {
  const ticketType = await ctx.db.get(ticketTypeId);

  if (!ticketType) {
    throw new Error("Ticket type not found.");
  }

  await requireEventCapability(
    ctx,
    ticketType.eventId,
    "manage_tickets"
  );

  return ticketType;
}

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
      .take(100);
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
    await requireEventCapability(
      ctx,
      args.eventId,
      "manage_tickets"
    );

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

    await requireTicketTypeAccess(ctx, ticketTypeId);

    await ctx.db.patch(ticketTypeId, rest);

    return true;
  },
});

export const remove = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },

  handler: async (ctx, args) => {
    await requireTicketTypeAccess(
      ctx,
      args.ticketTypeId
    );

    await ctx.db.delete(args.ticketTypeId);

    return true;
  },
});


export const toggleSoldOut = mutation({
  args: {
    ticketTypeId: v.id("ticketTypes"),
  },
  handler: async (ctx, args) => {
    const ticketType = await requireTicketTypeAccess(
      ctx,
      args.ticketTypeId
    );

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
    const ticketType = await requireTicketTypeAccess(
      ctx,
      args.ticketTypeId
    );

    await ctx.db.patch(args.ticketTypeId, {
      salesPaused: !(ticketType.salesPaused ?? false),
    });

    return true;
  },
});
