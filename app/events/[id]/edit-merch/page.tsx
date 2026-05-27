"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function EditMerchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const eventId = id as Id<"events">;

  const merch = useQuery(api.merch.getByEvent, { eventId });

  if (merch === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading merch...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            Merch Management
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Edit Event Merch
          </h1>

          <p className="mt-2 text-zinc-400">
            Select a merch item to edit or add new merch for this event.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href={`/events/${eventId}/add-merch`}
            className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-black hover:bg-orange-400"
          >
            Add Merch
          </Link>

          <Link
            href={`/events/${eventId}`}
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white hover:border-white"
          >
            Back to Event
          </Link>
        </div>

        {merch.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10">
            <h2 className="text-2xl font-black">No merch found</h2>
            <p className="mt-2 text-zinc-400">
              Add merch first, then it will appear here for editing.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {merch.map((item: any) => (
              <Link
                key={item._id}
                href={`/host/events/${eventId}/merch/${item._id}/edit`}
                className="rounded-3xl border border-white/10 bg-zinc-950 p-5 transition hover:border-orange-400/50 hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">{item.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                      ${item.price ?? 0} · Inventory: {item.inventory ?? "N/A"}
                    </p>
                  </div>

                  <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                    Edit
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
