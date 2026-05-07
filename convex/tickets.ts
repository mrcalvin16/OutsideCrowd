import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTicket = mutation({
  args: {
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in to get a ticket.");
    }

    const existingTicket = await ctx.db
      .query("tickets")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", identity.subject).eq("eventId", args.eventId)
      )
      .first();

    if (existingTicket) {
      throw new Error("You already have a ticket for this event.");
    }

    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    const qrCode = `outsidecrowd-${args.eventId}-${identity.subject}-${Date.now()}`;

    const ticketId = await ctx.db.insert("tickets", {
      eventId: args.eventId,
      userId: identity.subject,
      qrCode,
      checkedIn: false,
      createdAt: Date.now(),
    });

    return ticketId;
  },
});

export const getMyTickets = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return Promise.all(
      tickets.map(async (ticket) => {
        const event = await ctx.db.get(ticket.eventId);

        return {
          ...ticket,
          event,
        };
      })
    );
  },
});

export const getTicketForCheckIn = query({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_qrCode", (q) => q.eq("qrCode", args.qrCode))
      .first();

    if (!ticket) {
      return null;
    }

    const event = await ctx.db.get(ticket.eventId);

    return {
      ticket,
      event,
    };
  },
});

export const checkInTicket = mutation({
  args: {
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("You must be signed in.");
    }

    const ticket = await ctx.db
      .query("tickets")
      .withIndex("by_qrCode", (q) => q.eq("qrCode", args.qrCode))
      .first();

    if (!ticket) {
      throw new Error("Invalid ticket.");
    }

    const event = await ctx.db.get(ticket.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    if (event.userId !== identity.subject) {
      throw new Error("You are not allowed to check in tickets for this event.");
    }

    if (ticket.checkedIn) {
      throw new Error("This ticket has already been checked in.");
    }

    await ctx.db.patch(ticket._id, {
      checkedIn: true,
      checkedInAt: Date.now(),
    });

    return {
      success: true,
      message: "Ticket checked in successfully.",
      ticketId: ticket._id,
      eventName: event.name,
    };
  },
});