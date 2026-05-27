import { query } from "./_generated/server";

export const getOrganizerAnalytics = query({
  args: {},

  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        grossSales: 0,
        ticketsSold: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
        totalTicketsSold: 0,
        totalEvents: 0,
        salesByEvent: [],
        recentSales: [],
        dailyRevenue: [],
        trafficSources: [],
      };
    }

    const userId = identity.subject;

    const events = await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    const tickets = await ctx.db.query("tickets").collect();

    const eventViews = await ctx.db.query("eventViews").collect();

    let totalPageViews = 0;

    const salesByEvent = events.map((event) => {
      const eventTickets = tickets.filter(
        (ticket) => ticket.eventId === event._id
      );

      const eventPageViews = eventViews.filter(
        (view) => view.eventId === event._id
      ).length;

      const ticketsSold = eventTickets.length;

      const price =
        typeof event.price === "number"
          ? event.price
          : Number(event.price || 0);

      const revenue = ticketsSold * price;

      totalPageViews += eventPageViews;

      return {
        eventId: event._id,
        name: event.name || "Untitled Event",
        price,
        ticketsSold,
        revenue,
        pageViews: eventPageViews,
      };
    });

    salesByEvent.sort((a, b) => b.revenue - a.revenue);

    const totalTicketsSold = salesByEvent.reduce(
      (sum, event) => sum + event.ticketsSold,
      0
    );

    const totalRevenue = salesByEvent.reduce(
      (sum, event) => sum + event.revenue,
      0
    );

    const bestSellingCount =
      salesByEvent.length > 0
        ? Math.max(...salesByEvent.map((event) => event.ticketsSold))
        : 0;

    const totalConversionRate =
      totalPageViews > 0
        ? Math.round((totalTicketsSold / totalPageViews) * 100)
        : 0;

    const trafficSources = [
      {
        label: "Direct",
        value: eventViews.filter((view) => view.source === "direct").length,
      },
      {
        label: "Instagram",
        value: eventViews.filter((view) => view.source === "instagram").length,
      },
      {
        label: "TikTok",
        value: eventViews.filter((view) => view.source === "tiktok").length,
      },
      {
        label: "Referral",
        value: eventViews.filter(
          (view) =>
            view.source !== "direct" &&
            view.source !== "instagram" &&
            view.source !== "tiktok"
        ).length,
      },
    ];

    return {
      totalEvents: events.length,
      totalTicketsSold,
      totalRevenue,
      totalPageViews,
      totalConversionRate,
      bestSellingCount,
      salesByEvent,
      trafficSources,
    };
  },
});