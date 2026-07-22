"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Clock, ListOrdered, LogOut, OctagonXIcon } from "lucide-react";
import { useState } from "react";

import Spinner from "./Spinner";
import { useToast } from "@/hooks/use-toast";

export default function JoinQueue({
  eventId,
  userId,
}: {
  eventId: Id<"events">;
  userId: string;
}) {
  const { toast } = useToast();

  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const joinWaitingList = useMutation(api.waitingList.joinWaitingList);
  const leaveWaitingList = useMutation(api.waitingList.leaveWaitingList);

  const waitingListStatus = useQuery(
    api.waitingList.getMyWaitingListStatusForEvent,
    { eventId }
  );

  const userTicket = useQuery(api.tickets.getMyTicketForEvent, {
    eventId,
  });

  const event = useQuery(api.events.getById, { eventId });

  if (
    waitingListStatus === undefined ||
    userTicket === undefined ||
    event === undefined
  ) {
    return <Spinner />;
  }

  if (!event || userTicket) {
    return null;
  }

  const isEventOwner =
    userId === event.userId || userId === event.organizerId;

  const eventDate = event.eventDate ?? 0;
  const isPastEvent = eventDate > 0 && eventDate < Date.now();

  const totalTickets = event.totalTickets ?? 0;
  const ticketsSold = event.ticketsSold ?? 0;
  const isSoldOut =
    totalTickets > 0 && ticketsSold >= totalTickets;

  async function handleJoinQueue() {
    setIsJoining(true);

    try {
      await joinWaitingList({ eventId });

      toast({
        title: "You joined the waiting list",
        description:
          "We’ll keep your place in line for this event.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to join the waiting list.";

      toast({
        variant: "destructive",
        title: "Unable to join",
        description: message,
      });
    } finally {
      setIsJoining(false);
    }
  }

  async function handleLeaveQueue() {
    setIsLeaving(true);

    try {
      await leaveWaitingList({ eventId });

      toast({
        title: "You left the waiting list",
        description: "Your place in line has been removed.",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to leave the waiting list.";

      toast({
        variant: "destructive",
        title: "Unable to leave",
        description: message,
      });
    } finally {
      setIsLeaving(false);
    }
  }

  if (isEventOwner) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-gray-700">
        <OctagonXIcon className="h-5 w-5" />
        <span>You cannot buy a ticket for your own event</span>
      </div>
    );
  }

  if (isPastEvent) {
    return (
      <div className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-3 text-gray-500">
        <Clock className="h-5 w-5" />
        <span>Event has ended</span>
      </div>
    );
  }

  if (waitingListStatus) {
    return (
      <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center justify-center gap-2 text-blue-900">
          <ListOrdered className="h-5 w-5" />

          <span className="font-semibold">
            You are number {waitingListStatus.position} on the waiting list
          </span>
        </div>

        <button
          type="button"
          onClick={handleLeaveQueue}
          disabled={isLeaving}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {isLeaving ? "Leaving..." : "Leave Waiting List"}
        </button>
      </div>
    );
  }

  if (!isSoldOut) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-lg font-semibold text-red-600">
          This event is currently sold out
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Join the waiting list to reserve your place in line.
        </p>
      </div>

      <button
        type="button"
        onClick={handleJoinQueue}
        disabled={isJoining}
        className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isJoining ? "Joining..." : "Join Waiting List"}
      </button>
    </div>
  );
}
