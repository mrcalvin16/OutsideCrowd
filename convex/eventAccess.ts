import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const EVENT_ROLES = [
  "owner",
  "admin",
  "ticket_manager",
  "check_in_staff",
  "marketing",
  "viewer",
] as const;

export type EventRole = (typeof EVENT_ROLES)[number];

export type EventCapability =
  | "manage_event"
  | "manage_team"
  | "manage_payouts"
  | "manage_tickets"
  | "issue_comp_tickets"
  | "check_in"
  | "manage_marketing"
  | "view_reports";

type EventContext = QueryCtx | MutationCtx;

const CAPABILITIES: Record<
  EventRole,
  readonly EventCapability[]
> = {
  owner: [
    "manage_event",
    "manage_team",
    "manage_payouts",
    "manage_tickets",
    "issue_comp_tickets",
    "check_in",
    "manage_marketing",
    "view_reports",
  ],

  admin: [
    "manage_event",
    "manage_team",
    "manage_tickets",
    "issue_comp_tickets",
    "check_in",
    "manage_marketing",
    "view_reports",
  ],

  ticket_manager: [
    "manage_tickets",
    "issue_comp_tickets",
    "check_in",
    "view_reports",
  ],

  check_in_staff: ["check_in"],

  marketing: [
    "manage_marketing",
    "view_reports",
  ],

  viewer: ["view_reports"],
};

const staffRoleValidator = v.union(
  v.literal("admin"),
  v.literal("ticket_manager"),
  v.literal("check_in_staff"),
  v.literal("marketing"),
  v.literal("viewer")
);

export function roleCan(
  role: EventRole,
  capability: EventCapability
): boolean {
  return CAPABILITIES[role].includes(capability);
}

export async function requireIdentity(
  ctx: EventContext
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You must be signed in.");
  }

  return identity;
}

export async function getEventRole(
  ctx: EventContext,
  eventId: Id<"events">,
  userId: string
): Promise<EventRole | null> {
  const event = await ctx.db.get(eventId);

  if (!event) {
    throw new Error("Event not found.");
  }

  if (
    event.userId === userId ||
    event.organizerId === userId
  ) {
    return "owner";
  }

  const teamMember = await ctx.db
    .query("eventTeamMembers")
    .withIndex("by_event_user", (q) =>
      q
        .eq("eventId", eventId)
        .eq("userId", userId)
    )
    .unique();

  if (
    !teamMember ||
    teamMember.status !== "active"
  ) {
    return null;
  }

  return teamMember.role;
}

export async function requireEventCapability(
  ctx: EventContext,
  eventId: Id<"events">,
  capability: EventCapability
) {
  const identity = await requireIdentity(ctx);

  const role = await getEventRole(
    ctx,
    eventId,
    identity.subject
  );

  if (
    !role ||
    !roleCan(role, capability)
  ) {
    throw new Error(
      "You do not have permission to perform this action."
    );
  }

  return {
    identity,
    role,
  };
}

export const getMyEventAccess = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const role = await getEventRole(
      ctx,
      args.eventId,
      identity.subject
    );

    return {
      role,
      capabilities: role
        ? CAPABILITIES[role]
        : [],
    };
  },
});

export const listEventTeam = query({
  args: {
    eventId: v.id("events"),
  },

  handler: async (ctx, args) => {
    await requireEventCapability(
      ctx,
      args.eventId,
      "manage_team"
    );

    const members = await ctx.db
      .query("eventTeamMembers")
      .withIndex("by_event", (q) =>
        q.eq("eventId", args.eventId)
      )
      .collect();

    return members.sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
});

export const upsertEventTeamMember = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    role: staffRoleValidator,
  },

  handler: async (ctx, args) => {
    const { identity } =
      await requireEventCapability(
        ctx,
        args.eventId,
        "manage_team"
      );

    const now = Date.now();

    const existing = await ctx.db
      .query("eventTeamMembers")
      .withIndex("by_event_user", (q) =>
        q
          .eq("eventId", args.eventId)
          .eq("userId", args.userId)
      )
      .unique();

    const email =
      args.email?.trim().toLowerCase();

    const name = args.name?.trim();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name,
        role: args.role,
        status: "active",
        updatedAt: now,
      });

      return existing._id;
    }

    return await ctx.db.insert(
      "eventTeamMembers",
      {
        eventId: args.eventId,
        userId: args.userId,
        email,
        name,
        role: args.role,
        status: "active",
        invitedBy: identity.subject,
        createdAt: now,
      }
    );
  },
});

export const revokeEventTeamMember =
  mutation({
    args: {
      eventId: v.id("events"),
      memberId: v.id("eventTeamMembers"),
    },

    handler: async (ctx, args) => {
      await requireEventCapability(
        ctx,
        args.eventId,
        "manage_team"
      );

      const member = await ctx.db.get(
        args.memberId
      );

      if (
        !member ||
        member.eventId !== args.eventId
      ) {
        throw new Error(
          "Team member not found."
        );
      }

      await ctx.db.patch(args.memberId, {
        status: "revoked",
        updatedAt: Date.now(),
      });

      return {
        success: true,
      };
    },
  });
