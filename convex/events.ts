import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * GET ALL EVENTS
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("desc").collect();
  },
});

/**
 * GET EVENT BY ID
 */
export const getById = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

/**
 * CREATE EVENT
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    dateString: v.optional(v.string()),
    price: v.optional(v.number()),
    totalTickets: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      ticketsSold: 0,
    });
  },
});

/**
 * UPDATE EVENT
 */
export const update = mutation({
  args: {
    eventId: v.id("events"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    dateString: v.optional(v.string()),
    price: v.optional(v.number()),
    totalTickets: v.optional(v.number()),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { eventId, ...updates }) => {
    await ctx.db.patch(eventId, updates);

    return {
      success: true,
    };
  },
});

/**
 * DELETE EVENT
 */
export const remove = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, { eventId }) => {
    await ctx.db.delete(eventId);

    return {
      success: true,
    };
  },
});

/**
 * GET IMAGE URL
 */
export const getImageUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

/**
 * GENERATE IMAGE UPLOAD URL
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});