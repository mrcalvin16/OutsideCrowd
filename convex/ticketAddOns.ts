import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireEventCapability } from "./eventAccess";

async function requireAddOnAccess(
  ctx: MutationCtx,
  addOnId: Id<"ticketAddOns">
) {
  const addOn = await ctx.db.get(addOnId);

  if (!addOn) {
    throw new Error("Add-on not found.");
  }

  await requireEventCapability(
    ctx,
    addOn.eventId,
    "manage_tickets"
  );

  return addOn;
}

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

    isRequired: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    await requireEventCapability(
      ctx,
      args.eventId,
      "manage_tickets"
    );

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

    await requireAddOnAccess(ctx, addOnId);

    await ctx.db.patch(addOnId, rest);

    return true;
  },
});

export const remove = mutation({
  args: {
    addOnId: v.id("ticketAddOns"),
  },

  handler: async (ctx, args) => {
    await requireAddOnAccess(
      ctx,
      args.addOnId
    );

    await ctx.db.delete(args.addOnId);

    return true;
  },
});


export const toggleSoldOut = mutation({
  args: {
    addOnId: v.id("ticketAddOns"),
  },
  handler: async (ctx, args) => {
    const addOn = await requireAddOnAccess(
      ctx,
      args.addOnId
    );

    await ctx.db.patch(args.addOnId, {
      isSoldOut: !(addOn.isSoldOut ?? false),
    });

    return true;
  },
});
