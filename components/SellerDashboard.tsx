"use client";

import EventForm from "@/components/EventForm";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Link from "next/link";
import BudgetPlanner from "@/components/BudgetPlanner";

export default function SellerDashboard() {
  const { user } = useUser();
  const events = useQuery(api.events.getSellerEvents, user ? { userId: user.id } : "skip");

  if (!user) {
    return <main className="min-h-screen bg-black text-white p-10">Sign in to host events.</main>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-black mb-8">Organizer Dashboard</h1>

      <section className="mb-10 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <h2 className="text-2xl font-black mb-4">Create Event</h2>
        <EventForm mode="create" />
      </section>

      <section>
        <h2 className="text-2xl font-black mb-4">My Hosted Events</h2>

        {!events ? (
          <p className="text-zinc-400">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-zinc-400">No hosted events yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event: any) => (
              <Link
                key={event._id}
                href={`/event/${event._id}`}
                className="rounded-2xl border border-white/10 bg-zinc-900 p-5 hover:border-red-500 transition"
              >
                <h3 className="text-xl font-black">{event.name}</h3>
                <p className="mt-2 text-zinc-400">{event.location}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {new Date(event.eventDate).toLocaleDateString()}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-black p-3">
                    <p className="text-zinc-500">Sold</p>
                    <p className="text-xl font-black text-red-400">{event.metrics?.soldTickets ?? 0}</p>
                  </div>
                  <div className="rounded-xl bg-black p-3">
                    <p className="text-zinc-500">Revenue</p>
                    <p className="text-xl font-black text-red-400">${event.metrics?.revenue ?? 0}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
          {events?.[0]?._id && <BudgetPlanner eventId={events[0]._id} />}
    </main>
  );
}
