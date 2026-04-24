"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function TicketsPage() {
  const { user } = useUser();

  const tickets = useQuery(
    api.events.getUserTickets,
    user ? { userId: user.id } : "skip"
  );

  if (!user) return <main className="min-h-screen bg-black text-white p-10">Sign in to view tickets</main>;
  if (!tickets) return <main className="min-h-screen bg-black text-white p-10">Loading...</main>;

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-black mb-6">My Tickets</h1>

      {tickets.length === 0 ? (
        <p className="text-zinc-400">No tickets yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tickets.map((ticket: any) => (
            <Link
              key={ticket._id}
              href={`/event/${ticket.eventId}`}
              className="bg-zinc-900 border border-white/10 rounded-2xl p-5 hover:border-red-500 transition"
            >
              <p className="text-sm text-red-400 font-bold mb-2">OutsideCrowd Ticket</p>
              <h2 className="text-xl font-black">{ticket.event?.name || "Event"}</h2>
              <p className="text-zinc-400 mt-2">{ticket.event?.location || "Location TBD"}</p>
              <p className="text-zinc-500 text-sm mt-1">
                {ticket.event?.eventDate
                  ? new Date(ticket.event.eventDate).toLocaleDateString()
                  : "Date TBD"}
              </p>
              <p className="mt-4 inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold">
                {ticket.status || "Active"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
