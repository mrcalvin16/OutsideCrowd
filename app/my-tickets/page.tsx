"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export default function MyTicketsPage() {
  const { user, isLoaded } = useUser();

  const tickets = useQuery(
    api.tickets.getUserTickets,
    user ? {} : "skip"
  );

  if (!isLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-zinc-400">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black px-6 py-10 text-white">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold">My Tickets</h1>

          <p className="mt-4 text-zinc-400">
            Sign in to view your tickets.
          </p>

          <div className="mt-6">
            <SignInButton mode="modal">
              <button className="rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200">
                Sign In
              </button>
            </SignInButton>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
              OutsideCrowd
            </p>

            <h1 className="mt-2 text-4xl font-bold">My Tickets</h1>

            <p className="mt-3 text-zinc-400">
              View your claimed event tickets.
            </p>
          </div>

          <UserButton afterSignOutUrl="/" />
        </div>

        {tickets === undefined && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <p className="text-zinc-400">Loading tickets...</p>
          </div>
        )}

        {tickets && tickets.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
            <h2 className="text-2xl font-semibold">No tickets yet</h2>

            <p className="mt-3 text-zinc-400">
              Browse events and claim your first ticket.
            </p>

            <Link
              href="/events"
              className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 font-semibold text-black hover:bg-zinc-200"
            >
              Browse Events
            </Link>
          </div>
        )}

        {tickets && tickets.length > 0 && (
          <div className="grid gap-5">
            {tickets.map((ticket) => (
              <Link
                key={ticket._id}
                href={`/events/${ticket.eventId}`}
                className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 transition hover:border-zinc-600"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                      Ticket
                    </p>

                    <h2 className="mt-2 text-2xl font-bold">
                      {ticket.event?.name || "Untitled Event"}
                    </h2>

                    <p className="mt-2 text-zinc-400">
                      {ticket.event?.dateString || "Date TBD"}
                    </p>

                    <p className="mt-1 text-zinc-500">
                      {ticket.event?.location || "Location TBD"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-black px-5 py-4 text-sm">
                    <p className="text-zinc-500">Status</p>

                    <p
                      className={`mt-1 font-semibold ${
                        ticket.checkedIn
                          ? "text-yellow-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {ticket.checkedIn ? "Checked In" : "Valid"}
                    </p>
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