"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

function EventImage({ storageId }: { storageId?: Id<"_storage"> }) {
  const imageUrl = useQuery(
    api.events.getImageUrl,
    storageId ? { storageId } : "skip"
  );

  if (!storageId || imageUrl === null) {
    return (
      <div className="flex h-48 items-center justify-center bg-zinc-900 text-white/40">
        No image
      </div>
    );
  }

  if (imageUrl === undefined) {
    return (
      <div className="flex h-48 items-center justify-center bg-zinc-900 text-white/40">
        Loading image...
      </div>
    );
  }

  return <img src={imageUrl} alt="Event" className="h-48 w-full object-cover" />;
}

export default function EventsPage() {
  const { user } = useUser();
  const [view, setView] = useState<"all" | "mine">("all");

  const events = useQuery(api.events.getAll);

  if (events === undefined) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading events...
      </main>
    );
  }

  const visibleEvents =
    view === "mine" && user
      ? events.filter((event) => event.userId === user.id)
      : events;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Browse Events</h1>
            <p className="mt-2 text-white/60">
              Discover events happening on OutsideCrowd.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/15 px-5 py-2 font-semibold text-white hover:bg-white/10"
            >
              Home
            </Link>

            <Link
              href="/my-tickets"
              className="rounded-full border border-white/15 px-5 py-2 font-semibold text-white hover:bg-white/10"
            >
              My Tickets
            </Link>

            <SignedIn>
              <Link
                href="/create-event"
                className="rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-white/90"
              >
                Create Event
              </Link>

              <UserButton />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-white/90">
                  Login
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        <SignedIn>
          <div className="mb-8 flex gap-3">
            <button
              onClick={() => setView("all")}
              className={`rounded-full px-5 py-2 font-semibold ${
                view === "all"
                  ? "bg-white text-black"
                  : "border border-white/15 text-white hover:bg-white/10"
              }`}
            >
              All Events
            </button>

            <button
              onClick={() => setView("mine")}
              className={`rounded-full px-5 py-2 font-semibold ${
                view === "mine"
                  ? "bg-purple-600 text-white"
                  : "border border-white/15 text-white hover:bg-white/10"
              }`}
            >
              My Events
            </button>
          </div>
        </SignedIn>

        {visibleEvents.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
            <div className="mb-6 text-5xl">🎟️</div>

            <h2 className="text-2xl font-semibold">
              {view === "mine"
                ? "You haven’t created any events yet"
                : "No events yet"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-white/60">
              {view === "mine"
                ? "Create your first event and it will appear here."
                : "Once events are created, they’ll show up here."}
            </p>

            <Link
              href="/create-event"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-white/90"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <Link
                key={event._id}
                href={`/events/${event._id}`}
                className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 transition hover:-translate-y-1 hover:border-purple-500/60"
              >
                <EventImage storageId={event.imageStorageId} />

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold">{event.name}</h2>

                      {event.userId === user?.id && (
                        <p className="mt-1 text-xs font-semibold text-purple-400">
                          Your event
                        </p>
                      )}
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-black">
                      {event.price ? `$${event.price}` : "Free"}
                    </span>
                  </div>

                  {event.location && (
                    <p className="text-sm text-white/60">{event.location}</p>
                  )}

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/50">
                    <span>{event.dateString || "Date TBD"}</span>
                    <span>
                      {event.totalTickets
                        ? `${event.totalTickets} tickets`
                        : "Tickets TBD"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}