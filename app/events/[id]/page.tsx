"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

function EventImage({ storageId }: { storageId?: Id<"_storage"> }) {
  const imageUrl = useQuery(
    api.events.getImageUrl,
    storageId ? { storageId } : "skip"
  );

  if (!storageId || imageUrl === null) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center bg-zinc-900 text-white/40">
        No event image
      </div>
    );
  }

  if (imageUrl === undefined) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center bg-zinc-900 text-white/40">
        Loading image...
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt="Event"
      className="h-[360px] w-full object-cover"
    />
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { id } = use(params);

  const event = useQuery(api.events.getById, {
    eventId: id as Id<"events">,
  });

  const userTickets = useQuery(
    api.tickets.getUserTickets,
    user
      ? {
          userId: user.id,
        }
      : "skip"
  );

  const deleteEvent = useMutation(api.events.remove);
  const createTicket = useMutation(api.tickets.createTicket);
  const joinWaitlist = useMutation(api.waitingList.join);

  const waitlistPosition = useQuery(
    api.waitingList.position,
    user && event
      ? {
          eventId: event._id,
          userId: user.id,
        }
      : "skip"
  );

  async function handleDelete() {
    if (!event) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    await deleteEvent({
      eventId: event._id,
    });

    router.push("/events");
  }

  async function handleGetTicket() {
    if (!user) {
      alert("Please sign in to get tickets.");
      return;
    }

    if (!event) return;

    try {
      await createTicket({
        eventId: event._id,
        userId: user.id,
      });

      alert("Ticket added 🎟️");
      router.push("/my-tickets");
    } catch (err: any) {
      const message = err?.message || "";

      if (message.includes("already have a ticket")) {
        alert("You already purchased a ticket for this event.");
        return;
      }

      alert(message || "Something went wrong getting your ticket.");
    }
  }

  async function handleJoinWaitlist() {
    if (!user) {
      alert("Please sign in to join the waitlist.");
      return;
    }

    if (!event) return;

    try {
      const result = await joinWaitlist({
        eventId: event._id,
        userId: user.id,
      });

      if (result?.alreadyJoined) {
        alert("You're already on the waitlist.");
      } else {
        alert("You joined the waitlist 🎉");
      }
    } catch (err: any) {
      alert(err.message || "Something went wrong joining the waitlist.");
    }
  }

  if (event === undefined) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading event...
      </main>
    );
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <Link href="/events" className="text-purple-400 hover:underline">
          Back to events
        </Link>
      </main>
    );
  }

  const isOwner = user?.id && event.userId === user.id;
  const ticketsSold = event.ticketsSold ?? 0;

  const soldOut =
    typeof event.totalTickets === "number" &&
    event.totalTickets > 0 &&
    ticketsSold >= event.totalTickets;

  const remainingTickets =
    typeof event.totalTickets === "number"
      ? Math.max(event.totalTickets - ticketsSold, 0)
      : null;

  const alreadyPurchased =
    userTickets?.some((ticket) => ticket.eventId === event._id) ?? false;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/events"
            className="text-sm text-white/60 hover:text-white"
          >
            ← Back to events
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/my-tickets"
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              My Tickets
            </Link>

            <SignedIn>
              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90">
                  Login
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl">
          <EventImage storageId={event.imageStorageId} />

          <div className="space-y-6 p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-purple-400">
                  OutsideCrowd Event
                </p>

                <h1 className="text-4xl font-bold tracking-tight">
                  {event.name}
                </h1>

                {event.location && (
                  <p className="mt-3 text-white/60">{event.location}</p>
                )}
              </div>

              <div className="rounded-2xl bg-white px-5 py-3 text-black">
                <p className="text-xs font-medium uppercase text-black/50">
                  Price
                </p>
                <p className="text-2xl font-bold">
                  {event.price ? `$${event.price}` : "Free"}
                </p>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-col gap-3 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/70">
                  You created this event. You can manage it here.
                </p>

                <div className="flex gap-3">
                  <Link
                    href={`/events/${event._id}/edit`}
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90"
                  >
                    Edit Event
                  </Link>

                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {event.description && (
              <p className="max-w-3xl text-lg leading-8 text-white/70">
                {event.description}
              </p>
            )}

            <div className="grid gap-4 border-t border-white/10 pt-6 md:grid-cols-3">
              <div className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm text-white/40">Date</p>
                <p className="mt-1 font-semibold">
                  {event.dateString || "Date coming soon"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm text-white/40">Time</p>
                <p className="mt-1 font-semibold">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleTimeString()
                    : "Time coming soon"}
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 p-5">
                <p className="text-sm text-white/40">Tickets</p>
                <p className="mt-1 font-semibold">
                  {soldOut
                    ? "Sold out"
                    : remainingTickets !== null
                      ? `${remainingTickets} of ${event.totalTickets} available`
                      : "Available soon"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {alreadyPurchased ? (
                <div className="space-y-3">
                  <div className="w-full rounded-2xl border border-green-500/30 bg-green-500/10 px-6 py-4 text-center">
                    <p className="text-lg font-bold text-green-400">
                      Ticket Already Purchased 🎟️
                    </p>
                    <p className="mt-1 text-sm text-white/60">
                      You already have a ticket for this event.
                    </p>
                  </div>

                  <Link
                    href="/my-tickets"
                    className="flex w-full justify-center rounded-2xl bg-white px-6 py-4 text-lg font-bold text-black hover:bg-zinc-200"
                  >
                    View My Ticket
                  </Link>
                </div>
              ) : soldOut ? (
                <button
                  type="button"
                  onClick={handleJoinWaitlist}
                  className="w-full rounded-2xl bg-white px-6 py-4 text-lg font-bold text-black hover:bg-zinc-200"
                >
                  Join Waitlist
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGetTicket}
                  className="w-full rounded-2xl bg-purple-600 px-6 py-4 text-lg font-bold text-white hover:bg-purple-500"
                >
                  Get Tickets
                </button>
              )}

              {waitlistPosition && !alreadyPurchased && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-sm text-white/60">
                    You are currently
                  </p>

                  <p className="text-2xl font-bold text-purple-400">
                    #{waitlistPosition.position}
                  </p>

                  <p className="text-sm text-white/60">
                    on the waitlist
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}