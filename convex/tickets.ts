import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTicket = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const attendeeIdentifiers = [
      identity.subject,
      identity.email?.trim().toLowerCase(),
    ].filter(
      (value): value is string => Boolean(value)
    );

    let existingTicket = null;

    for (const attendeeId of new Set(attendeeIdentifiers)) {
      existingTicket = await ctx.db
        .query("tickets")
        .withIndex("by_event_user", (q) =>
          q
            .eq("eventId", args.eventId)
            .eq("userId", attendeeId)
        )
        .first();

      if (existingTicket) {
        break;
      }
    }

    if (existingTicket) {
      throw new Error("You already have a ticket for this event.");
    }

    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    const ticketId = await ctx.db.insert("tickets", {
      eventId: args.eventId,
      userId: identity.subject,
      status: "active",
      checkedIn: false,
      purchasedAt: Date.now(),
      createdAt: Date.now(),
      qrCode: `${args.eventId}:${identity.subject}:${Date.now()}`,
    });

    await ctx.db.patch(args.eventId, {
      ticketsSold: (event.ticketsSold ?? 0) + 1,
    });

    return ticketId;
  },
});


export const createTicketsAfterPayment = mutation({
  args: {
    webhookSecret: v.string(),
    eventId: v.id("events"),
    buyerEmail: v.string(),
    buyerName: v.optional(v.string()),
    stripeCheckoutSessionId: v.string(),
    tickets: v.array(
      v.object({
        ticketTypeId: v.optional(v.id("ticketTypes")),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    if (args.webhookSecret !== process.env.STRIPE_WEBHOOK_SHARED_SECRET) {
      throw new Error("Unauthorized webhook.");
    }

    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    const existing = await ctx.db
      .query("tickets")
      .filter((q) =>
        q.eq(q.field("stripeCheckoutSessionId"), args.stripeCheckoutSessionId)
      )
      .first();

    if (existing) {
      return true;
    }

    const totalQuantity = args.tickets.reduce(
      (sum, line) => sum + Math.max(0, line.quantity),
      0
    );

    if (totalQuantity <= 0) {
      throw new Error("Please select at least one ticket.");
    }

    for (const line of args.tickets) {
      if (line.quantity <= 0) continue;

      let ticketTypeName: string | undefined = undefined;
      let unitPrice = event.price ?? 0;

      if (line.ticketTypeId) {
        const ticketType = await ctx.db.get(line.ticketTypeId);

        if (!ticketType) {
          throw new Error("Ticket type not found.");
        }

        if (ticketType.eventId !== args.eventId) {
          throw new Error("Ticket type does not belong to this event.");
        }

        ticketTypeName = ticketType.name;
        unitPrice = ticketType.price;

        await ctx.db.patch(line.ticketTypeId, {
          sold: (ticketType.sold ?? 0) + line.quantity,
        });
      }

      for (let i = 0; i < line.quantity; i++) {
        await ctx.db.insert("tickets", {
          eventId: args.eventId,
          userId: args.buyerEmail,
          buyerEmail: args.buyerEmail,
          buyerName: args.buyerName,
          ticketTypeId: line.ticketTypeId,
          ticketTypeName,
          unitPrice,
          stripeCheckoutSessionId: args.stripeCheckoutSessionId,
          status: "active",
          checkedIn: false,
          purchasedAt: Date.now(),
          createdAt: Date.now(),
          qrCode: `${args.eventId}:${args.buyerEmail}:${Date.now()}:${i}`,
        });
      }
    }

    await ctx.db.patch(args.eventId, {
      ticketsSold: (event.ticketsSold ?? 0) + totalQuantity,
    });

    return true;
  },
});


export const getUserTickets = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const attendeeIdentifiers = [
      identity.subject,
      identity.email?.trim().toLowerCase(),
    ].filter(
      (value): value is string => Boolean(value)
    );

    const ticketGroups = await Promise.all(
      [...new Set(attendeeIdentifiers)].map(
        (attendeeId) =>
          ctx.db
            .query("tickets")
            .withIndex("by_user", (q) =>
              q.eq("userId", attendeeId)
            )
            .order("desc")
            .take(100)
      )
    );

    const tickets = [
      ...new Map(
        ticketGroups
          .flat()
          .map((ticket) => [
            String(ticket._id),
            ticket,
          ])
      ).values(),
    ];

    return await Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);

        let imageUrl = null;

        if (event?.imageStorageId) {
          imageUrl = await ctx.storage.getUrl(event.imageStorageId);
        }

        return {
          ...ticket,
          event,
          imageUrl,
        };
      })
    );
  },
});

export const getTicketsByEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();
  },
});

export const getMyTicketForEvent = query({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const attendeeIdentifiers = [
      identity.subject,
      identity.email?.trim().toLowerCase(),
    ].filter(
      (value): value is string => Boolean(value)
    );

    for (const attendeeId of new Set(attendeeIdentifiers)) {
      const ticket = await ctx.db
        .query("tickets")
        .withIndex("by_event_user", (q) =>
          q
            .eq("eventId", args.eventId)
            .eq("userId", attendeeId)
        )
        .first();

      if (ticket) {
        return ticket;
      }
    }

    return null;
  },
});

export const checkInTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const ticket = await ctx.db.get(args.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const event = await ctx.db.get(ticket.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.userId !== identity.subject && event.organizerId !== identity.subject) {
      throw new Error("You do not have permission to check in this ticket.");
    }

    if (ticket.checkedIn) {
      throw new Error("Ticket has already been checked in.");
    }

    await ctx.db.patch(args.ticketId, {
      checkedIn: true,
      checkedInAt: Date.now(),
      status: "checked_in",
    });

    return true;
  },
});

export const getTicketByQRCode = query({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db.query("tickets").collect();

    return tickets.find((ticket) => ticket.qrCode === args.qrCode) ?? null;
  },
});

export const getTicketDetails = query({
  args: {
    ticketId: v.id("tickets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const ticket = await ctx.db.get(args.ticketId);

    if (!ticket) {
      return null;
    }

    const attendeeIdentifiers = new Set(
      [
        identity.subject,
        identity.email?.trim().toLowerCase(),
      ].filter((value): value is string => Boolean(value))
    );

    if (!attendeeIdentifiers.has(String(ticket.userId))) {
      return null;
    }

    const event = await ctx.db.get(ticket.eventId);

    let imageUrl = null;

    if (event?.imageStorageId) {
      imageUrl = await ctx.storage.getUrl(event.imageStorageId);
    }

    return {
      ...ticket,
      event,
      imageUrl,
      holder: {
        name:
          ticket.buyerName ||
          identity.name ||
          "Guest",
        email:
          ticket.buyerEmail ||
          identity.email?.trim().toLowerCase() ||
          "",
        userId: String(ticket.userId),
      },
    };
  },
});

export const cancelTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const ticket = await ctx.db.get(args.ticketId);

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    if (ticket.userId !== identity.subject) {
      throw new Error("You do not have permission to cancel this ticket.");
    }

    const event = await ctx.db.get(ticket.eventId);

    await ctx.db.patch(args.ticketId, {
      status: "cancelled",
    });

    if (event) {
      await ctx.db.patch(ticket.eventId, {
        ticketsSold: Math.max((event.ticketsSold ?? 1) - 1, 0),
      });
    }

    return true;
  },
});

export const getAttendeesByEvent = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId)
      )
      .collect();

    const attendees = await Promise.all(
      tickets.slice(0, 12).map(async (ticket) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_userId", (q) =>
            q.eq("userId", String(ticket.userId))
          )
          .first();

        return {
          id: ticket._id,
          name:
            user?.organizerName ||
            user?.name ||
            "Guest",
          avatarUrl: user?.avatarUrl,
        };
      })
    );

    return attendees;
  },
});
