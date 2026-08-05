"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { CalendarDays, Mail } from "lucide-react";
import { api } from "@/convex/_generated/api";

export default function MessagesPage() {
  const events = useQuery(api.events.getMyEvents);
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.2em] text-violet-400">
          Guest communications
        </p>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">Email Guests</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">
          Choose an event to prepare audience-targeted communications and
          publish event-page updates.
        </p>
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        {events === undefined ? (
          [1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-2xl bg-white/[.035]"
            />
          ))
        ) : events.length ? (
          events.map((event) => (
            <Link
              key={event._id}
              href={`/host/events/${event._id}/messages`}
              className="group flex items-center gap-4 rounded-2xl border border-white/[.08] bg-white/[.035] p-5 transition hover:border-violet-400/25 hover:bg-white/[.055]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Mail className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black">
                  {event.name}
                </span>
                <span className="mt-1 flex items-center gap-1 text-xs text-zinc-600">
                  <CalendarDays className="h-3 w-3" />{" "}
                  {new Date(event.eventDate).toLocaleDateString()}
                </span>
              </span>
              <span className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-white">
                →
              </span>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-zinc-600">
            Create an event before preparing guest communications.
          </div>
        )}
      </div>
      <div className="mt-6 rounded-2xl border border-orange-400/15 bg-orange-400/[.06] p-4 text-xs leading-5 text-orange-100/70">
        <strong className="text-orange-200">Delivery status:</strong> event-page
        announcements publish immediately. Email campaigns can be prepared and
        saved, but external email delivery remains disabled until an approved
        delivery provider is connected.
      </div>
    </div>
  );
}
