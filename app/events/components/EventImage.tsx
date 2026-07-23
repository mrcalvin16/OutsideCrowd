"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type EventImageProps = {
  storageId?: Id<"_storage">;
};

export default function EventImage({ storageId }: EventImageProps) {
  const imageUrl = useQuery(
    api.events.getImageUrl,
    storageId ? { storageId } : "skip"
  );

  if (!storageId) {
    return (
      <div className="flex h-56 items-center justify-center bg-zinc-900 text-zinc-500">
        No Image
      </div>
    );
  }

  if (imageUrl === undefined) {
    return (
      <div className="flex h-56 items-center justify-center bg-zinc-900 text-zinc-500">
        Loading image...
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex h-56 items-center justify-center bg-zinc-900 text-zinc-500">
        Image unavailable
      </div>
    );
  }

  return (
    <div className="relative h-56 w-full overflow-hidden">
      <Image
        src={imageUrl}
        alt="Event image"
        fill
        className="object-cover transition duration-300 group-hover:scale-105"
      />
    </div>
  );
}
