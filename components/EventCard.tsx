"use client";

import Link from "next/link";

type EventCardProps = {
  event: {
    _id: string;
    name?: string;
    description?: string;
    location?: string;
    date?: string | number;
    imageUrl?: string;
    price?: number;
  };
};

function formatDate(date?: string | number) {
  if (!date) return "Date coming soon";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price?: number) {
  if (price === undefined || price === null) return "Free";
  if (price === 0) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event._id}`} className="block h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition hover:border-red-500/60 hover:bg-zinc-800">
        <div className="relative h-44 w-full overflow-hidden bg-zinc-800">
          <img
            src={event.imageUrl || "/event-placeholder.jpg"}
            alt={event.name || "Event image"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />

          <div className="absolute right-3 top-3 rounded-full bg-black/80 px-3 py-1 text-sm font-semibold text-white">
            {formatPrice(event.price)}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-semibold text-white">
            {event.name || "Untitled Event"}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm text-gray-400">
            {event.description || "No description available."}
          </p>

          <div className="mt-4 space-y-1 text-sm text-gray-400">
            <p>📍 {event.location || "Location coming soon"}</p>
            <p>📅 {formatDate(event.date)}</p>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
              Event
            </span>

            <span className="text-sm font-medium text-white">
              View →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}