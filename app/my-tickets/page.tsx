"use client";

import Link from "next/link";
import {
  SignInButton,
  UserButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCodeSVG } from "qrcode.react";

export default function MyTicketsPage() {
  const { user } = useUser();

  const tickets = useQuery(
    api.tickets.getUserTickets,
    user
      ? {
          userId: user.id,
        }
      : "skip"
  );

  const events = useQuery(api.events.getAll);

  const ticketEvents =
    tickets && events
      ? tickets
          .map((ticket) => {
            const event = events.find((e) => e._id === ticket.eventId);

            return {
              ticket,
              event,
            };
          })
          .filter((item) => item.event)
      : [];

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Tickets</h1>
            <p className="mt-2 text-white/60">
              Your purchased tickets and QR codes.
            </p>
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-full bg-white px-5 py-2 font-semibold text-black hover:bg-white/90">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        <SignedOut>
          <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
            <div className="mb-6 text-5xl">🔐</div>

            <h2 className="text-2xl font-semibold">Login to view tickets</h2>

            <p className="mx-auto mt-3 max-w-md text-white/60">
              Sign in to see your purchased tickets, event details, and QR codes.
            </p>

            <SignInButton mode="modal">
              <button className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-white/90">
                Login
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {tickets === undefined || events === undefined ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
              <div className="mb-6 text-5xl">⏳</div>

              <h2 className="text-2xl font-semibold">Loading tickets...</h2>
            </div>
          ) : ticketEvents.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-zinc-950 p-10 text-center">
              <div className="mb-6 text-5xl">🎟️</div>

              <h2 className="text-2xl font-semibold">No tickets yet</h2>

              <p className="mx-auto mt-3 max-w-md text-white/60">
                Once you buy tickets for an event, they’ll appear here.
              </p>

              <Link
                href="/events"
                className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black hover:bg-white/90"
              >
                Browse Events
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {ticketEvents.map(({ ticket, event }) => {
                if (!event) return null;

                const qrValue =
                  ticket.qrCode ||
                  `OC-${ticket._id}-${ticket.eventId}-${ticket.userId}`;

                return (
                  <div
                    key={ticket._id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
                  >
                    <div className="border-b border-white/10 bg-white px-6 py-5 text-black">
                      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-black/50">
                        OutsideCrowd Ticket
                      </p>

                      <h2 className="mt-2 text-2xl font-black">
                        {event.name}
                      </h2>
                    </div>

                    <div className="space-y-5 p-6">
                      <div className="flex justify-center">
                        <div className="rounded-3xl bg-white p-5">
                          <QRCodeSVG value={qrValue} size={180} />
                        </div>
                      </div>

                      <div className="rounded-2xl bg-white/5 p-4 text-center">
                        <p className="text-sm text-white/40">Ticket Code</p>
                        <p className="mt-1 break-all font-mono text-sm text-white">
                          {qrValue}
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {event.location && (
                          <div className="rounded-2xl bg-white/5 p-4">
                            <p className="text-sm text-white/40">Location</p>
                            <p className="mt-1 font-semibold">
                              {event.location}
                            </p>
                          </div>
                        )}

                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-sm text-white/40">Date</p>
                          <p className="mt-1 font-semibold">
                            {event.dateString || "Coming soon"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-sm text-white/40">Purchased</p>
                          <p className="mt-1 font-semibold">
                            {new Date(ticket.purchasedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-4">
                          <p className="text-sm text-white/40">Status</p>
                          <p className="mt-1 font-semibold capitalize">
                            {ticket.checkedIn
                              ? "Checked In"
                              : ticket.status || "Active"}
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/events/${event._id}`}
                        className="inline-flex w-full justify-center rounded-2xl bg-purple-600 px-6 py-4 font-bold text-white hover:bg-purple-500"
                      >
                        View Event
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SignedIn>
      </section>
    </main>
  );
}