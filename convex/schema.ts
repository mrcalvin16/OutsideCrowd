import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({


eventInteractions: defineTable({
  userId: v.optional(v.string()),
  eventId: v.string(),
  type: v.string(), // view | click | save | map_hover
  createdAt: v.float64(),
}).index("by_user", ["userId"])
  .index("by_event", ["eventId"]),

  users: defineTable({
    clerkId: v.optional(v.string()),
    userId: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),

    email: v.optional(v.string()),
    name: v.optional(v.string()),

    role: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),

    createdAt: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),

    organizerName: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    instagram: v.optional(v.string()),

    isOrganizer: v.optional(v.boolean()),
    verificationRequested: v.optional(v.boolean()),
    isVerifiedOrganizer: v.optional(v.boolean()),

    avatarStorageId: v.optional(v.id("_storage")),
    avatarUrl: v.optional(v.string()),

    bannerStorageId: v.optional(v.id("_storage")),
    bannerUrl: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_userId", ["userId"])
    .index("by_tokenIdentifier", ["tokenIdentifier"]),

  events: defineTable({
    name: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    location: v.string(),

    eventDate: v.float64(),
    dateString: v.string(),

    price: v.optional(v.float64()),
    totalTickets: v.optional(v.float64()),
    ticketsSold: v.optional(v.float64()),

    imageStorageId: v.optional(v.id("_storage")),

    userId: v.string(),
    organizerId: v.optional(v.string()),

    createdAt: v.optional(v.float64()),

    venueName: v.optional(v.string()),
    venueAddress: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),

    refundPolicy: v.optional(v.string()),
    refundDeadline: v.optional(v.string()),
    refundContactEmail: v.optional(v.string()),

    dressCode: v.optional(v.string()),
    ageRequirement: v.optional(v.string()),
    parkingInfo: v.optional(v.string()),
    entryNotes: v.optional(v.string()),

    // PROMOTION / MONETIZATION
    isPromoted: v.optional(v.boolean()),
    promotionTier: v.optional(v.string()),
    promotionEndsAt: v.optional(v.float64()),
    featuredWeight: v.optional(v.float64()),
  })
    .index("by_userId", ["userId"])
    .index("by_eventDate", ["eventDate"])
    .index("by_city", ["city"])
    .index("by_venueName", ["venueName"]),

  tickets: defineTable({
    eventId: v.id("events"),
    userId: v.union(v.id("users"), v.string()),

    quantity: v.optional(v.float64()),
    purchasedAt: v.optional(v.float64()),
    createdAt: v.optional(v.float64()),

    status: v.optional(v.string()),

    checkedIn: v.optional(v.boolean()),
    checkedInAt: v.optional(v.float64()),

    qrCode: v.optional(v.string()),
    buyerEmail: v.optional(v.string()),
    buyerName: v.optional(v.string()),
    ticketTypeId: v.optional(v.id("ticketTypes")),
    ticketTypeName: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
  })
    .index("by_event_user", ["eventId", "userId"])
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),

  waitingList: defineTable({
    eventId: v.id("events"),
    userId: v.union(v.id("users"), v.string()),

    createdAt: v.optional(v.float64()),
    status: v.optional(v.string()),
    offerExpiresAt: v.optional(v.float64()),
  })
    .index("by_event_user", ["eventId", "userId"])
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),

  ticketTypes: defineTable({
    eventId: v.id("events"),

    name: v.string(),
    description: v.optional(v.string()),

    price: v.float64(),

    quantity: v.optional(v.float64()),
    sold: v.optional(v.float64()),

    perks: v.optional(v.array(v.string())),

    isActive: v.optional(v.boolean()),
    isSoldOut: v.optional(v.boolean()),
    salesPaused: v.optional(v.boolean()),

    createdAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"]),

  eventCreative: defineTable({
    eventId: v.id("events"),
    userId: v.optional(v.union(v.id("users"), v.string())),

    title: v.optional(v.string()),
    prompt: v.optional(v.string()),
    style: v.optional(v.string()),
    caption: v.optional(v.string()),

    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    sourceEventId: v.optional(v.string()),
    campaignStatus: v.optional(v.string()),

    createdAt: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),

  ticketAddOns: defineTable({
    eventId: v.id("events"),

    name: v.string(),
    description: v.optional(v.string()),

    price: v.float64(),

    quantity: v.optional(v.float64()),

    isRequired: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    isSoldOut: v.optional(v.boolean()),

    createdAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"]),



  discountCodes: defineTable({
    eventId: v.id("events"),

    code: v.string(),
    normalizedCode: v.string(),

    discountType: v.union(
      v.literal("percentage"),
      v.literal("fixed")
    ),

    discountValue: v.float64(),

    isActive: v.boolean(),

    startsAt: v.optional(v.float64()),
    expiresAt: v.optional(v.float64()),

    maxRedemptions: v.optional(v.float64()),
    redemptionCount: v.float64(),

    minimumQuantity: v.optional(v.float64()),

    ticketTypeIds: v.optional(
      v.array(v.id("ticketTypes"))
    ),

    createdBy: v.string(),

    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"])
    .index("by_event_code", ["eventId", "normalizedCode"]),


  merch: defineTable({
    eventId: v.id("events"),

    organizerId: v.optional(v.string()),

    name: v.string(),
    description: v.optional(v.string()),

    price: v.float64(),
    inventory: v.optional(v.float64()),

    sizes: v.optional(v.array(v.string())),

    featured: v.optional(v.boolean()),
    limitedDrop: v.optional(v.boolean()),
    pickupAtEvent: v.optional(v.boolean()),

    isActive: v.optional(v.boolean()),
    isPreorder: v.optional(v.boolean()),

    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),

    createdAt: v.optional(v.float64()),
  }).index("by_eventId", ["eventId"]),

  merchOrders: defineTable({
    merchId: v.id("merch"),
    userId: v.string(),

    quantity: v.float64(),
    total: v.float64(),

    createdAt: v.optional(v.float64()),
  })
    .index("by_merchId", ["merchId"])
    .index("by_userId", ["userId"]),

  eventViews: defineTable({
    eventId: v.id("events"),

    userId: v.optional(v.string()),

    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    path: v.optional(v.string()),

    createdAt: v.float64(),
  })
    .index("by_event", ["eventId"])
    .index("by_createdAt", ["createdAt"]),


  boostOrders: defineTable({
    eventId: v.id("events"),
    organizerId: v.string(),

    tier: v.string(),
    amount: v.float64(),

    status: v.optional(v.string()),

    durationDays: v.optional(v.float64()),
    featuredWeight: v.optional(v.float64()),

    stripeCheckoutSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),

    createdAt: v.optional(v.float64()),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"])
    .index("by_organizer", ["organizerId"])
    .index("by_status", ["status"]),


  savedEvents: defineTable({
    userId: v.string(),
    eventId: v.id("events"),
    createdAt: v.float64(),
  })
    .index("by_user", ["userId"])
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"]),


  followedOrganizers: defineTable({
    userId: v.string(),
    organizerUserId: v.string(),
    createdAt: v.float64(),
  })
    .index("by_user", ["userId"])
    .index("by_organizer", ["organizerUserId"])
    .index("by_user_organizer", ["userId", "organizerUserId"]),

});
