"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { useStorageUrl } from "@/lib/utils";

export default function EventList({ events: propEvents }: any) {
  const data = useQuery(api.events.get); const list = propEvents || data || [];

  if (!propEvents && data === undefined) {
    return <p className="text-zinc-400">Loading events...</p>;
  }

  if (list.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-zinc-950 p-12 text-center">
        <Ticket className="mx-auto mb-4 h-10 w-10 text-zinc-500" />
        <h3 className="text-xl font-bold text-white">No events yet</h3>
        <p className="mt-2 text-zinc-400">Create your first event from the Host Event page.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
      {list.map((event: any) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const imageUrl = useStorageUrl(event.imageStorageId);

  return (
    <Link
      href={`/event/${event._id}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-xl transition hover:-translate-y-1 hover:border-red-500/60 hover:shadow-red-900/20"
    >
      <div className="relative h-56 bg-zinc-900">
        {imageUrl !== undefined ? (
          <Image
            src={imageUrl}
            alt={event.name || "Event image"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-red-700 via-orange-600 to-yellow-500" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-2 inline-flex rounded-full bg-red-600/90 px-3 py-1 text-xs font-black text-white">
            ${event.price ?? 0}
          </div>
          <h3 className="text-2xl font-black text-white leading-tight">
            {event.name || "Untitled Event"}
          </h3>
        </div>
      </div>

      <div className="p-5">
        <p className="line-clamp-2 text-sm text-zinc-400">
          {event.description || "No description yet."}
        </p>

        <div className="mt-5 space-y-2 text-sm text-zinc-300">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-400" />
            {event.location || "Location TBD"}
          </p>

          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-red-400" />
            {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "Date TBD"}
          </p>
        </div>

        <button className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white hover:bg-red-700">
          Get Tickets
        </button>
      </div>
    </Link>
  );
}
