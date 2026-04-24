import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addItem = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    type: v.union(v.literal("expense"), v.literal("income")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("budgetItems", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getItems = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db
      .query("budgetItems")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect();
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("budgetItems") },
  handler: async (ctx, { itemId }) => {
    await ctx.db.delete(itemId);
  },
});
