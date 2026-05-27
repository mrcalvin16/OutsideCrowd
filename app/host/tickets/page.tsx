"use client";

import Link from "next/link";

export default function HostTicketsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          Ticket Operations
        </p>
        <h1 className="mt-2 text-5xl font-black">Ticket Management</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Manage guest orders, ticket status, event capacity, and attendee operations.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-8">
          <h2 className="text-2xl font-black">Event Ticket Tools</h2>
          <p className="mt-2 text-zinc-400">
            Use each event’s ticket setup page for ticket tiers, add-ons, and event-specific controls.
          </p>
        </div>

        <Link
          href="/host"
          className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-black"
        >
          Back to Host Dashboard
        </Link>
      </section>
    </main>
  );
}
