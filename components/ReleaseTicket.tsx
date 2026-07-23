"use client";

import { Id } from "@/convex/_generated/dataModel";

/**
 * The legacy timed ticket-offer flow has been retired.
 *
 * Ticket purchases now use the standard event checkout route.
 */
export default function ReleaseTicket({
  eventId: _eventId,
  waitingListId: _waitingListId,
}: {
  eventId: Id<"events">;
  waitingListId: Id<"waitingList">;
}) {
  return null;
}
