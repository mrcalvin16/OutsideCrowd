"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type OrganizerOrbProps = {
  userId: string;
  eventCount: number;
};

export default function OrganizerOrb({
  userId,
  eventCount,
}: OrganizerOrbProps) {
  const data = useQuery(api.organizers.getOrganizerByUserId, { userId });

  const organizer = data?.organizer;

  const displayName =
    organizer?.organizerName || organizer?.name || "Host";

  return (
    <Link
      href={`/organizers/${userId}`}
      className="group flex min-w-[110px] flex-col items-center text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-violet-300/30 bg-black text-2xl font-black text-white shadow-[0_0_35px_rgba(139,92,246,0.18)] transition group-hover:scale-105 group-hover:border-violet-300">
        {organizer?.avatarUrl ? (
          <img
            src={organizer.avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          displayName.charAt(0).toUpperCase()
        )}
      </div>

      <p className="mt-3 line-clamp-1 text-sm font-bold text-white">
        {displayName}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {eventCount} event{eventCount === 1 ? "" : "s"}
      </p>
    </Link>
  );
}
