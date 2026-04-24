"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { useStorageUrl } from "@/lib/utils";

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
          {tickets.map((ticket: any) => {
            const imageUrl = useStorageUrl(ticket.event?.imageStorageId);
            return (
              <Link
                key={ticket._id}
                href={`/event/${ticket.eventId}`}
                className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500 transition"
              >
                {imageUrl && (
                  <div className="relative h-40 w-full">
                    <Image src={imageUrl} alt="" fill className="object-cover" />
                  </div>
                )}

                <div className="p-4">
                  <h2 className="text-lg font-black">{ticket.event?.name}</h2>
                  <p className="text-zinc-400 text-sm mt-1">{ticket.event?.location}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {new Date(ticket.event?.eventDate).toLocaleDateString()}
                  </p>

                  <span className="mt-3 inline-block bg-red-600 px-3 py-1 text-xs font-bold rounded-full">
                    {ticket.status || "Active"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
