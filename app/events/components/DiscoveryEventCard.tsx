"use client";

import Link from "next/link";
import EventImage from "./EventImage";

type DiscoveryEventCardProps = {
  event: any;
  isSaved: boolean;
  onToggleSave: () => void;
};

export default function DiscoveryEventCard({
  event,
  isSaved,
  onToggleSave,
}: DiscoveryEventCardProps) {
  return (
    <article className="group overflow-hidden rounded-[1.45rem] border border-white/10 bg-zinc-950 transition hover:-translate-y-1 hover:border-violet-400/45">
      <div className="relative h-[220px] overflow-hidden">
        <Link href={`/events/${event._id}`}>
          <EventImage storageId={event.imageStorageId} />
        </Link>

        <button
          type="button"
          aria-label={isSaved ? "Remove saved event" : "Save event"}
          onClick={onToggleSave}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border text-lg ${
            isSaved
              ? "border-violet-300 bg-violet-600 text-white"
              : "border-white/20 bg-black/60 text-white"
          }`}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">
          {event.dateString || "Date coming soon"}
        </p>

        <Link href={`/events/${event._id}`}>
          <h3 className="mt-3 line-clamp-2 min-h-[56px] text-2xl font-black leading-tight text-white">
            {event.name}
          </h3>
        </Link>

        <p className="mt-4 truncate text-sm text-zinc-500">
          {event.location || "Location coming soon"}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
          <p className="text-lg font-black text-white">
            ${(event.price ?? 0).toLocaleString()}
          </p>

          <Link
            href={`/events/${event._id}`}
            className="rounded-full bg-white px-5 py-2.5 text-xs font-black text-black"
          >
            View event
          </Link>
        </div>
      </div>
    </article>
  );
}
