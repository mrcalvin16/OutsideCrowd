import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireEventCapability } from "./eventAccess";

const channelValidator = v.union(
  v.literal("event_page"),
  v.literal("email")
);

const audienceValidator = v.union(
  v.literal("all"),
  v.literal("checked_in"),
  v.literal("not_checked_in"),
  v.literal("vip")
);

const excludedTicketStatuses = new Set([
  "refunded",
  "revoked",
  "cancelled",
  "canceled",
]);

function isActiveTicket(ticket: Doc<"tickets">): boolean {
  return !excludedTicketStatuses.has(
    ticket.status?.toLowerCase() ?? "active"
  );
}

function ticketHolderKey(ticket: Doc<"tickets">): string {
  return (
    ticket.buyerEmail?.trim().toLowerCase() ||
    String(ticket.userId)
  );
}

export const getWorkspace = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    await requireEventCapability(
      ctx,
      args.eventId,
      "manage_marketing"
    );

    const ticketLimit = 2_000;
    const [messages, tickets, ticketTypes] =
      await Promise.all([
        ctx.db
          .query("eventMessages")
          .withIndex("by_event_created", (q) =>
            q.eq("eventId", args.eventId)
          )
          .order("desc")
          .take(100),
        ctx.db
          .query("tickets")
          .withIndex("by_event", (q) =>
            q.eq("eventId", args.eventId)
          )
          .take(ticketLimit),
        ctx.db
          .query("ticketTypes")
          .withIndex("by_event", (q) =>
            q.eq("eventId", args.eventId)
          )
          .take(100),
      ]);
    const vipTicketTypeIds = new Set(
      ticketTypes
        .filter((ticketType) =>
          /\bvip\b/i.test(ticketType.name)
        )
        .map((ticketType) => ticketType._id)
    );
    const audiences = {
      all: new Set<string>(),
      checked_in: new Set<string>(),
      not_checked_in: new Set<string>(),
      vip: new Set<string>(),
    };
    const reachableEmails = {
      all: new Set<string>(),
      checked_in: new Set<string>(),
      not_checked_in: new Set<string>(),
      vip: new Set<string>(),
    };

    for (const ticket of tickets) {
      if (!isActiveTicket(ticket)) {
        continue;
      }

      const holderKey = ticketHolderKey(ticket);
      const email = ticket.buyerEmail
        ?.trim()
        .toLowerCase();
      const attendanceAudience = ticket.checkedIn
        ? "checked_in"
        : "not_checked_in";
      const isVip =
        /\bvip\b/i.test(
          ticket.ticketTypeName ?? ""
        ) ||
        Boolean(
          ticket.ticketTypeId &&
            vipTicketTypeIds.has(ticket.ticketTypeId)
        );

      audiences.all.add(holderKey);
      audiences[attendanceAudience].add(holderKey);

      if (email) {
        reachableEmails.all.add(email);
        reachableEmails[attendanceAudience].add(email);
      }

      if (isVip) {
        audiences.vip.add(holderKey);
        if (email) {
          reachableEmails.vip.add(email);
        }
      }
    }

    return {
      messages,
      audiences: [
        {
          key: "all" as const,
          label: "All ticket holders",
          count: audiences.all.size,
          emailReachable: reachableEmails.all.size,
        },
        {
          key: "checked_in" as const,
          label: "Checked-in guests",
          count: audiences.checked_in.size,
          emailReachable: reachableEmails.checked_in.size,
        },
        {
          key: "not_checked_in" as const,
          label: "Not checked in",
          count: audiences.not_checked_in.size,
          emailReachable:
            reachableEmails.not_checked_in.size,
        },
        {
          key: "vip" as const,
          label: "VIP ticket holders",
          count: audiences.vip.size,
          emailReachable: reachableEmails.vip.size,
        },
      ],
      isAudienceLimited: tickets.length === ticketLimit,
    };
  },
});

export const listPublishedForEvent = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("eventMessages")
      .withIndex("by_event_status", (q) =>
        q
          .eq("eventId", args.eventId)
          .eq("status", "published")
      )
      .order("desc")
      .take(20);

    return messages
      .filter(
        (message) => message.channel === "event_page"
      )
      .map((message) => ({
        id: message._id,
        subject: message.subject,
        body: message.body,
        publishedAt:
          message.publishedAt ?? message.updatedAt,
      }));
  },
});

export const saveMessage = mutation({
  args: {
    messageId: v.optional(v.id("eventMessages")),
    eventId: v.id("events"),
    subject: v.string(),
    body: v.string(),
    channel: channelValidator,
    audience: audienceValidator,
    publish: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    const { identity } = await requireEventCapability(
      ctx,
      args.eventId,
      "manage_marketing"
    );
    const subject = args.subject.trim();
    const body = args.body.trim();

    if (!subject || !body) {
      throw new Error(
        "Add both a subject and message before saving."
      );
    }

    if (subject.length > 120) {
      throw new Error(
        "Message subjects must be 120 characters or fewer."
      );
    }

    if (body.length > 2_000) {
      throw new Error(
        "Messages must be 2,000 characters or fewer."
      );
    }

    if (args.publish && args.channel !== "event_page") {
      throw new Error(
        "Email delivery is not connected yet. Save this campaign as a draft."
      );
    }

    const now = Date.now();
    const status = args.publish
      ? ("published" as const)
      : ("draft" as const);
    const audience =
      args.channel === "event_page"
        ? ("all" as const)
        : args.audience;

    if (args.messageId) {
      const existing = await ctx.db.get(args.messageId);

      if (!existing || existing.eventId !== args.eventId) {
        throw new Error("Message not found.");
      }

      await ctx.db.patch(args.messageId, {
        subject,
        body,
        channel: args.channel,
        audience,
        status,
        updatedAt: now,
        publishedAt: args.publish ? now : undefined,
      });

      return {
        id: args.messageId,
        status,
      };
    }

    const id = await ctx.db.insert("eventMessages", {
      eventId: args.eventId,
      authorUserId: identity.subject,
      subject,
      body,
      channel: args.channel,
      audience,
      status,
      createdAt: now,
      updatedAt: now,
      publishedAt: args.publish ? now : undefined,
    });

    return { id, status };
  },
});

export const archiveMessage = mutation({
  args: {
    id: v.id("eventMessages"),
  },

  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);

    if (!message) {
      throw new Error("Message not found.");
    }

    await requireEventCapability(
      ctx,
      message.eventId,
      "manage_marketing"
    );

    await ctx.db.patch(args.id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
