import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireEventCapability } from "./eventAccess";

const excludedSaleStatuses = new Set([
  "refunded",
  "revoked",
  "cancelled",
  "canceled",
]);

function quantity(ticket: Doc<"tickets">): number {
  return Math.max(1, Math.floor(ticket.quantity ?? 1));
}

function isPaid(ticket: Doc<"tickets">): boolean {
  const status = ticket.status?.toLowerCase() ?? "active";

  return (
    ticket.ticketSource !== "complimentary" &&
    ticket.ticketSource !== "manual" &&
    !excludedSaleStatuses.has(status)
  );
}

function isVip(ticket: Doc<"tickets">): boolean {
  return /vip|premium|backstage|table|platinum/i.test(
    ticket.ticketTypeName ?? ""
  );
}

export const getEventContext = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    await requireEventCapability(
      ctx,
      args.eventId,
      "view_reports"
    );

    const event = await ctx.db.get(args.eventId);

    if (!event) {
      throw new Error("Event not found.");
    }

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = now - 13 * 24 * 60 * 60 * 1000;
    const [tickets, ticketTypes, recentViews] = await Promise.all([
      ctx.db
        .query("tickets")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .take(2_000),
      ctx.db
        .query("ticketTypes")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .take(100),
      ctx.db
        .query("eventViews")
        .withIndex("by_event_and_createdAt", (q) =>
          q
            .eq("eventId", args.eventId)
            .gte("createdAt", thirtyDaysAgo)
        )
        .take(2_000),
    ]);
    const typePrices = new Map(
      ticketTypes.map((type) => [String(type._id), type.price])
    );
    const dailySales = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(
        fourteenDaysAgo + index * 24 * 60 * 60 * 1000
      );

      return {
        date: date.toISOString().slice(0, 10),
        tickets: 0,
        revenue: 0,
      };
    });
    const salesByDate = new Map(
      dailySales.map((day) => [day.date, day])
    );
    const typePerformance = new Map<
      string,
      { name: string; sold: number; revenue: number; price: number }
    >();
    let attendees = 0;
    let checkedIn = 0;
    let paidTickets = 0;
    let revenue = 0;
    let complimentaryTickets = 0;
    const missingVips: Array<{
      name: string;
      ticketType: string;
      partySize: number;
    }> = [];

    for (const ticket of tickets) {
      const ticketQuantity = quantity(ticket);
      const ticketType = ticket.ticketTypeName ?? "General Admission";
      const unitPrice =
        ticket.unitPrice ??
        (ticket.ticketTypeId
          ? typePrices.get(String(ticket.ticketTypeId))
          : undefined) ??
        event.price ??
        0;

      attendees += ticketQuantity;

      if (ticket.checkedIn) {
        checkedIn += ticketQuantity;
      }

      if (ticket.ticketSource === "complimentary") {
        complimentaryTickets += ticketQuantity;
      }

      if (isPaid(ticket)) {
        const ticketRevenue = unitPrice * ticketQuantity;
        paidTickets += ticketQuantity;
        revenue += ticketRevenue;

        const performance = typePerformance.get(ticketType) ?? {
          name: ticketType,
          sold: 0,
          revenue: 0,
          price: unitPrice,
        };

        performance.sold += ticketQuantity;
        performance.revenue += ticketRevenue;
        typePerformance.set(ticketType, performance);

        if (ticket.purchasedAt && ticket.purchasedAt >= fourteenDaysAgo) {
          const day = salesByDate.get(
            new Date(ticket.purchasedAt).toISOString().slice(0, 10)
          );

          if (day) {
            day.tickets += ticketQuantity;
            day.revenue += ticketRevenue;
          }
        }
      }

      if (!ticket.checkedIn && isVip(ticket) && missingVips.length < 50) {
        missingVips.push({
          name: ticket.buyerName?.trim() || "Unnamed VIP guest",
          ticketType,
          partySize: ticketQuantity,
        });
      }
    }

    return {
      generatedAt: now,
      isLimited: tickets.length === 2_000 || recentViews.length === 2_000,
      event: {
        name: event.name,
        description: event.description,
        category: event.category ?? "Uncategorized",
        date: event.eventDate,
        location: event.venueName || event.location,
        city: event.city ?? "",
        capacity: Math.max(0, Math.floor(event.totalTickets ?? 0)),
      },
      performance: {
        attendees,
        checkedIn,
        remaining: Math.max(attendees - checkedIn, 0),
        paidTickets,
        complimentaryTickets,
        revenue: Math.round(revenue * 100) / 100,
        viewsLast30Days: recentViews.length,
        sellThrough:
          (event.totalTickets ?? 0) > 0
            ? Math.round(
                (attendees / (event.totalTickets ?? 1)) * 1_000
              ) / 10
            : 0,
        checkInRate:
          attendees > 0
            ? Math.round((checkedIn / attendees) * 1_000) / 10
            : 0,
      },
      dailySales: dailySales.map((day) => ({
        ...day,
        revenue: Math.round(day.revenue * 100) / 100,
      })),
      ticketTypes: [...typePerformance.values()]
        .map((type) => ({
          ...type,
          revenue: Math.round(type.revenue * 100) / 100,
        }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 12),
      missingVips,
    };
  },
});
