import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireEventCapability } from "./eventAccess";

async function requireHost(
  ctx: MutationCtx | QueryCtx,
  eventId: Id<"events">,
) {
  const event = await ctx.db.get(eventId);
  if (!event) throw new Error("Event not found.");
  const { identity } = await requireEventCapability(ctx, eventId, "manage_tickets");
  return { identity, event };
}

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export const listByEvent = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    await requireHost(ctx, args.eventId);
    return await ctx.db
      .query("discountCodes")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .order("desc")
      .take(500);
  },
});

export const create = mutation({
  args: {
    eventId: v.id("events"),
    code: v.string(),
    discountType: v.union(v.literal("percentage"), v.literal("fixed")),
    discountValue: v.number(),
    ticketTypeIds: v.optional(v.array(v.id("ticketTypes"))),
    maxRedemptions: v.optional(v.number()),
    startsAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    minimumQuantity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { identity } = await requireHost(ctx, args.eventId);
    const normalizedCode = normalizeCode(args.code);

    if (normalizedCode.length < 3) {
      throw new Error("Discount codes must be at least 3 characters.");
    }
    if (args.discountValue <= 0) {
      throw new Error("Discount value must be greater than zero.");
    }
    if (args.discountType === "percentage" && args.discountValue > 100) {
      throw new Error("Percentage discounts cannot exceed 100%.");
    }
    if (args.expiresAt && args.startsAt && args.expiresAt <= args.startsAt) {
      throw new Error("Expiration must be after the start date.");
    }

    const existing = await ctx.db
      .query("discountCodes")
      .withIndex("by_event_code", (q) =>
        q.eq("eventId", args.eventId).eq("normalizedCode", normalizedCode),
      )
      .first();

    if (existing) throw new Error("That code already exists for this event.");

    const now = Date.now();
    return await ctx.db.insert("discountCodes", {
      eventId: args.eventId,
      code: normalizedCode,
      normalizedCode,
      discountType: args.discountType,
      discountValue: args.discountValue,
      ticketTypeIds: args.ticketTypeIds,
      maxRedemptions: args.maxRedemptions,
      redemptionCount: 0,
      startsAt: args.startsAt,
      expiresAt: args.expiresAt,
      minimumQuantity: args.minimumQuantity,
      isActive: true,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggleActive = mutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, args) => {
    const code = await ctx.db.get(args.discountCodeId);
    if (!code) throw new Error("Discount code not found.");
    await requireHost(ctx, code.eventId);
    await ctx.db.patch(args.discountCodeId, {
      isActive: code.isActive === false,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { discountCodeId: v.id("discountCodes") },
  handler: async (ctx, args) => {
    const code = await ctx.db.get(args.discountCodeId);
    if (!code) throw new Error("Discount code not found.");
    await requireHost(ctx, code.eventId);
    await ctx.db.delete(args.discountCodeId);
  },
});

export const validate = query({
  args: {
    eventId: v.id("events"),
    code: v.string(),
    subtotal: v.number(),
    quantity: v.number(),
    ticketTypeId: v.optional(v.id("ticketTypes")),
  },
  handler: async (ctx, args) => {
    const normalizedCode = normalizeCode(args.code);
    if (!normalizedCode) return null;

    const discount = await ctx.db
      .query("discountCodes")
      .withIndex("by_event_code", (q) =>
        q.eq("eventId", args.eventId).eq("normalizedCode", normalizedCode),
      )
      .first();

    if (!discount) return { valid: false, message: "Code not found." };
    const now = Date.now();
    if (discount.isActive === false) return { valid: false, message: "This code is inactive." };
    if (discount.startsAt && now < discount.startsAt) return { valid: false, message: "This code is not active yet." };
    if (discount.expiresAt && now > discount.expiresAt) return { valid: false, message: "This code has expired." };
    if (discount.maxRedemptions && (discount.redemptionCount ?? 0) >= discount.maxRedemptions) {
      return { valid: false, message: "This code has reached its redemption limit." };
    }
    if (discount.minimumQuantity && args.quantity < discount.minimumQuantity) {
      return { valid: false, message: `A minimum quantity of ${discount.minimumQuantity} is required.` };
    }
    if (
      discount.ticketTypeIds?.length &&
      (!args.ticketTypeId || !discount.ticketTypeIds.includes(args.ticketTypeId))
    ) {
      return { valid: false, message: "This code does not apply to the selected ticket." };
    }

    const raw = discount.discountType === "percentage"
      ? args.subtotal * (discount.discountValue / 100)
      : discount.discountValue;
    const discountAmount = Math.max(0, Math.min(args.subtotal, raw));

    return {
      valid: true,
      discountCodeId: discount._id,
      code: discount.code,
      discountAmount,
      finalTotal: Math.max(0, args.subtotal - discountAmount),
      message: `${discount.code} applied.`,
    };
  },
});
