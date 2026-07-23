from pathlib import Path
import sys

schema_path = Path("convex/schema.ts")

if not schema_path.exists():
    print("ERROR: convex/schema.ts was not found.")
    sys.exit(1)

schema = schema_path.read_text()

ticket_fields = '''    stripeCheckoutSessionId: v.optional(v.string()),

    // Complimentary and manually issued ticket metadata
    ticketSource: v.optional(
      v.union(
        v.literal("stripe"),
        v.literal("complimentary"),
        v.literal("manual")
      )
    ),
    issuedBy: v.optional(v.string()),
    compTicketId: v.optional(v.id("compTickets")),
    revokedAt: v.optional(v.float64()),
    revokedBy: v.optional(v.string()),
    checkedInBy: v.optional(v.string()),'''

old_ticket_field = '''    stripeCheckoutSessionId: v.optional(v.string()),'''

if "ticketSource: v.optional(" not in schema:
    if old_ticket_field not in schema:
        print("ERROR: Could not find stripeCheckoutSessionId in tickets table.")
        sys.exit(1)

    schema = schema.replace(
        old_ticket_field,
        ticket_fields,
        1,
    )
    print("Added complimentary-ticket fields to tickets table.")
else:
    print("Ticket metadata fields already exist. Skipping.")

old_ticket_indexes = '''    .index("by_event_user", ["eventId", "userId"])
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),'''

new_ticket_indexes = '''    .index("by_event_user", ["eventId", "userId"])
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_comp_ticket", ["compTicketId"]),'''

if '.index("by_comp_ticket", ["compTicketId"])' not in schema:
    if old_ticket_indexes not in schema:
        print("ERROR: Could not find the tickets index block.")
        sys.exit(1)

    schema = schema.replace(
        old_ticket_indexes,
        new_ticket_indexes,
        1,
    )
    print("Added comp-ticket index to tickets table.")
else:
    print("Comp-ticket index already exists. Skipping.")

new_tables = '''
  // Event-specific organizer and staff permissions
  eventTeamMembers: defineTable({
    eventId: v.id("events"),
    userId: v.string(),

    email: v.optional(v.string()),
    name: v.optional(v.string()),

    role: v.union(
      v.literal("admin"),
      v.literal("ticket_manager"),
      v.literal("check_in_staff"),
      v.literal("marketing"),
      v.literal("viewer")
    ),

    status: v.union(
      v.literal("active"),
      v.literal("invited"),
      v.literal("revoked")
    ),

    invitedBy: v.string(),
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_user", ["eventId", "userId"])
    .index("by_event_email", ["eventId", "email"]),

  // Complimentary ticket allocations issued by organizers
  compTickets: defineTable({
    eventId: v.id("events"),

    ticketId: v.optional(v.id("tickets")),
    ticketTypeId: v.optional(v.id("ticketTypes")),
    ticketTypeName: v.optional(v.string()),

    recipientName: v.string(),
    recipientEmail: v.string(),
    quantity: v.float64(),
    note: v.optional(v.string()),

    status: v.union(
      v.literal("active"),
      v.literal("revoked"),
      v.literal("redeemed")
    ),

    issuedBy: v.string(),
    issuedAt: v.float64(),

    revokedBy: v.optional(v.string()),
    revokedAt: v.optional(v.float64()),
    lastSentAt: v.optional(v.float64()),
  })
    .index("by_event", ["eventId"])
    .index("by_email", ["recipientEmail"])
    .index("by_ticket", ["ticketId"])
    .index("by_event_status", ["eventId", "status"]),

  // Audit history for complimentary tickets
  compTicketAudit: defineTable({
    eventId: v.id("events"),
    compTicketId: v.id("compTickets"),

    action: v.union(
      v.literal("issued"),
      v.literal("resent"),
      v.literal("revoked"),
      v.literal("restored"),
      v.literal("checked_in")
    ),

    performedBy: v.string(),
    details: v.optional(v.string()),
    createdAt: v.float64(),
  })
    .index("by_event", ["eventId"])
    .index("by_comp_ticket", ["compTicketId"]),

'''

event_creative_anchor = '''  eventCreative: defineTable({'''

if "eventTeamMembers: defineTable({" not in schema:
    if event_creative_anchor not in schema:
        print("ERROR: Could not find eventCreative table insertion point.")
        sys.exit(1)

    schema = schema.replace(
        event_creative_anchor,
        new_tables + event_creative_anchor,
        1,
    )
    print("Added event team, comp ticket, and audit tables.")
else:
    print("New tables already exist. Skipping.")

schema_path.write_text(schema)
print("Successfully updated convex/schema.ts")
