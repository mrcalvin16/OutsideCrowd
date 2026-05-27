"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function GenerateFlyerPage() {
  const params = useParams();
  const eventId = String(params?.id ?? "");

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-zinc-950 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
          OutsideCrowd Creative Studio
        </p>

        <h1 className="mt-4 text-4xl font-black">Flyer Generator</h1>

        <p className="mt-4 text-zinc-400">
          The flyer generator is being refreshed. Your event page is safe and live.
        </p>

        <Link
          href={`/events/${eventId}`}
          className="mt-8 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-black hover:bg-orange-400"
        >
          Back to Event
        </Link>
      </section>
    </main>
  );
}
