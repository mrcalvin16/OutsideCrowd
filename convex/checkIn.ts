import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You must be signed in.");
  }

  return identity;
}

async function requireEventAccess(
  ctx: any,
  eventId: any,
  userId: string,
) {
  const event = await ctx.db.get(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  const hasAccess =
    event.userId === userId ||
    event.organizerId === userId;

  if (!hasAccess) {
    throw new Error(
      "You do not have permission to manage check-in for this event.",
    );
  }

  return event;
}

async function getTicketGuest(ctx: any, ticket: any) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q: any) =>
      q.eq("userId", String(ticket.userId)),
    )
    .first();

  return {
    name:
      user?.name ||
      user?.organizerName ||
      user?.email ||
      "Guest",
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };
}

export const getOrganizerEvents = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const events = await ctx.db.query("events").collect();

    const ownedEvents = events.filter(
      (event) =>
        event.userId === identity.subject ||
        event.organizerId === identity.subject,
    );

    return ownedEvents
      .sort((a, b) => a.eventDate - b.eventDate)
      .map((event) => ({
        _id: event._id,
        name: event.name,
        dateString: event.dateString,
        eventDate: event.eventDate,
        location: event.location,
        venueName: event.venueName,
        totalTickets: event.totalTickets ?? 0,
        ticketsSold: event.ticketsSold ?? 0,
      }));
  },
});

export const getWorkspace = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const event = await ctx.db.get(args.eventId);

    if (!event) {
      return null;
    }

    const hasAccess =
      event.userId === identity.subject ||
      event.organizerId === identity.subject;

    if (!hasAccess) {
      return null;
    }

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId),
      )
      .collect();

    const guests = await Promise.all(
      tickets.map(async (ticket) => {
        const guest = await getTicketGuest(ctx, ticket);

        return {
          ticketId: ticket._id,
          name: guest.name,
          email: guest.email ?? "",
          avatarUrl: guest.avatarUrl,
          ticketType: "Admission",
          orderNumber: String(ticket._id).slice(-8).toUpperCase(),
          qrCode: ticket.qrCode ?? "",
          quantity: ticket.quantity ?? 1,
          status: ticket.status ?? "active",
          checkedIn: ticket.checkedIn ?? false,
          checkedInAt: ticket.checkedInAt,
        };
      }),
    );

    const recentActivity = await ctx.db
      .query("checkInActivity")
      .withIndex("by_event_time", (q) =>
        q.eq("eventId", args.eventId),
      )
      .order("desc")
      .take(20);

    const checkedInTickets = tickets.filter(
      (ticket) => ticket.checkedIn,
    );

    const checkedInGuests = checkedInTickets.reduce(
      (total, ticket) => total + (ticket.quantity ?? 1),
      0,
    );

    const totalGuests = tickets.reduce(
      (total, ticket) => total + (ticket.quantity ?? 1),
      0,
    );

    return {
      event: {
        _id: event._id,
        name: event.name,
        dateString: event.dateString,
        eventDate: event.eventDate,
        location: event.location,
        venueName: event.venueName,
        totalTickets: event.totalTickets ?? totalGuests,
        ticketsSold: event.ticketsSold ?? totalGuests,
      },

      stats: {
        checkedIn: checkedInGuests,
        remaining: Math.max(totalGuests - checkedInGuests, 0),
        totalGuests,
        orders: tickets.length,
      },

      guests,

      recentActivity: recentActivity.map((item) => ({
        _id: item._id,
        ticketId: item.ticketId,
        guestName: item.guestName,
        guestEmail: item.guestEmail ?? "",
        ticketType: item.ticketType ?? "Admission",
        quantity: item.quantity ?? 1,
        method: item.method,
        gate: item.gate ?? "Main Gate",
        checkedInAt: item.checkedInAt,
      })),
    };
  },
});

export const validateCode = query({
  args: {
    eventId: v.id("events"),
    code: v.string(),
  },

  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const event = await ctx.db.get(args.eventId);

    if (
      !event ||
      (
        event.userId !== identity.subject &&
        event.organizerId !== identity.subject
      )
    ) {
      return null;
    }

    const normalizedCode = args.code.trim();

    if (!normalizedCode) {
      return null;
    }

    const qrTicket = await ctx.db
      .query("tickets")
      .withIndex("by_qrCode", (q) =>
        q.eq("qrCode", normalizedCode),
      )
      .first();

    let ticket = qrTicket;

    if (!ticket) {
      const eventTickets = await ctx.db
        .query("tickets")
        .withIndex("by_event", (q) =>
          q.eq("eventId", args.eventId),
        )
        .collect();

      ticket =
        eventTickets.find(
          (candidate) =>
            String(candidate._id) === normalizedCode ||
            String(candidate._id)
              .slice(-8)
              .toLowerCase() === normalizedCode.toLowerCase(),
        ) ?? null;
    }

    if (!ticket || ticket.eventId !== args.eventId) {
      return null;
    }

    const guest = await getTicketGuest(ctx, ticket);

    return {
      ticketId: ticket._id,
      guestName: guest.name,
      guestEmail: guest.email ?? "",
      ticketType: "Admission",
      quantity: ticket.quantity ?? 1,
      checkedIn: ticket.checkedIn ?? false,
      checkedInAt: ticket.checkedInAt,
    };
  },
});

export const checkInTicket = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
    method: v.union(
      v.literal("qr"),
      v.literal("manual"),
      v.literal("search"),
    ),
    gate: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    await requireEventAccess(
      ctx,
      args.eventId,
      identity.subject,
    );

    const ticket = await ctx.db.get(args.ticketId);

    if (!ticket || ticket.eventId !== args.eventId) {
      throw new Error("Ticket not found for this event.");
    }

    const guest = await getTicketGuest(ctx, ticket);

    if (ticket.checkedIn) {
      return {
        status: "duplicate" as const,
        ticketId: ticket._id,
        guestName: guest.name,
        guestEmail: guest.email ?? "",
        ticketType: "Admission",
        quantity: ticket.quantity ?? 1,
        checkedInAt: ticket.checkedInAt,
      };
    }

    const checkedInAt = Date.now();

    await ctx.db.patch(ticket._id, {
      checkedIn: true,
      checkedInAt,
      status: "checked_in",
    });

    await ctx.db.insert("checkInActivity", {
      eventId: args.eventId,
      ticketId: ticket._id,

      staffUserId: identity.subject,

      guestName: guest.name,
      guestEmail: guest.email,
      ticketType: "Admission",

      method: args.method,
      gate: args.gate ?? "Main Gate",

      quantity: ticket.quantity ?? 1,
      checkedInAt,
    });

    return {
      status: "success" as const,
      ticketId: ticket._id,
      guestName: guest.name,
      guestEmail: guest.email ?? "",
      ticketType: "Admission",
      quantity: ticket.quantity ?? 1,
      checkedInAt,
    };
  },
});

export const undoCheckIn = mutation({
  args: {
    eventId: v.id("events"),
    ticketId: v.id("tickets"),
  },

  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    await requireEventAccess(
      ctx,
      args.eventId,
      identity.subject,
    );

    const ticket = await ctx.db.get(args.ticketId);

    if (!ticket || ticket.eventId !== args.eventId) {
      throw new Error("Ticket not found for this event.");
    }

    if (!ticket.checkedIn) {
      throw new Error("This ticket is not currently checked in.");
    }

    await ctx.db.patch(ticket._id, {
      checkedIn: false,
      checkedInAt: undefined,
      status: "active",
    });

    const activity = await ctx.db
      .query("checkInActivity")
      .withIndex("by_ticket", (q) =>
        q.eq("ticketId", ticket._id),
      )
      .order("desc")
      .first();

    if (activity) {
      await ctx.db.delete(activity._id);
    }

    return true;
  },
});
