"use client";

import Image from "next/image";
import Link from "next/link";

type PremiumEventCardProps = {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl?: string;
  organizerName: string;
  organizerAvatarUrl?: string;
  price?: number;
  sellingFast?: boolean;
};

export default function PremiumEventCard({
  id,
  title,
  date,
  location,
  imageUrl,
  organizerName,
  organizerAvatarUrl,
  price,
  sellingFast = false,
}: PremiumEventCardProps) {
  return (
    <Link
      href={`/events/${id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Event image
          </div>
        )}

        {sellingFast ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
            Selling fast
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-950">
            {title}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>{date}</p>
            <p>{location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {organizerAvatarUrl ? (
              <Image
                src={organizerAvatarUrl}
                alt={organizerName}
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {organizerName.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="truncate text-sm text-gray-600">
              {organizerName}
            </span>
          </div>

          {price !== undefined ? (
            <span className="shrink-0 text-sm font-semibold text-gray-950">
              {price === 0 ? "Free" : `$${price.toFixed(2)}`}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
