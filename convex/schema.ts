import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
    name: v.string(),
    description: v.string(),
    location: v.string(),

    eventDate: v.number(),
    dateString: v.string(),

    price: v.number(),
    totalTickets: v.number(),

    imageStorageId: v.optional(v.id("_storage")),

    userId: v.string(),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event_date", ["eventDate"]),

  tickets: defineTable({
    eventId: v.id("events"),

    userId: v.string(),

    qrCode: v.string(),

    checkedIn: v.boolean(),

    checkedInAt: v.optional(v.number()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_qrCode", ["qrCode"]),
});