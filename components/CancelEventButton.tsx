"use client";

import { Id } from "@/convex/_generated/dataModel";

/**
 * Event cancellation and automatic refunds are not currently enabled.
 *
 * This compatibility component remains in place so seller event cards do not
 * depend on the removed legacy refund action or cancellation mutation.
 */
export default function CancelEventButton({
  eventId: _eventId,
}: {
  eventId: Id<"events">;
}) {
  return null;
}
